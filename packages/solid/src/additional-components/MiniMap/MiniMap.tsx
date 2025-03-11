import { createEffect, createMemo, createSignal, onCleanup } from 'solid-js';
import cc from 'classcat';
import { getInternalNodesBounds, getBoundsOfRects, XYMinimap, type Rect, type XYMinimapInstance } from '@xyflow/system';

import { useStore, useStoreApi } from '../../hooks/useStore';
import { Panel } from '../../components/Panel';
import type { SolidFlowStore } from '../../types';

import MiniMapNodes from './MiniMapNodes';
import type { MiniMapProps } from './types';

const defaultWidth = 200;
const defaultHeight = 150;

const selector = (s: SolidFlowStore) => {
  const viewBB: Rect = {
    x: -s.transform[0] / s.transform[2],
    y: -s.transform[1] / s.transform[2],
    width: s.width / s.transform[2],
    height: s.height / s.transform[2],
  };

  return {
    viewBB,
    boundingRect: s.nodeLookup.size > 0 ? getBoundsOfRects(getInternalNodesBounds(s.nodeLookup), viewBB) : viewBB,
    rfId: s.rfId,
    panZoom: s.panZoom,
    translateExtent: s.translateExtent,
    flowWidth: s.width,
    flowHeight: s.height,
  };
};

const ARIA_LABEL_KEY = 'solid-flow__minimap-desc';

function MiniMap(props: MiniMapProps) {
  const store = useStoreApi();
  const [svg, setSvgRef] = createSignal<SVGSVGElement>();
  const { boundingRect, viewBB, rfId, panZoom, translateExtent, flowWidth, flowHeight } = useStore(selector);

  // Create memos for reactive props

  // Calculate dimensions based on reactive values
  const dimensions = createMemo(() => {
    const width = (props.style?.width as number) ?? defaultWidth;
    const height = (props.style?.height as number) ?? defaultHeight;
    const scaledWidth = boundingRect.width / width;
    const scaledHeight = boundingRect.height / height;
    const viewScale = Math.max(scaledWidth, scaledHeight);
    const viewWidth = viewScale * width;
    const viewHeight = viewScale * height;
    const offset = (props.offsetScale ?? 5) * viewScale;
    const x = boundingRect.x - (viewWidth - boundingRect.width) / 2 - offset;
    const y = boundingRect.y - (viewHeight - boundingRect.height) / 2 - offset;

    return {
      viewScale,
      viewWidth,
      viewHeight,
      offset,
      x,
      y,
      width: viewWidth + offset * 2,
      height: viewHeight + offset * 2,
    };
  });

  const labelledBy = createMemo(() => `${ARIA_LABEL_KEY}-${rfId}`);
  const [minimapInstance, setMinimapInstance] = createSignal<XYMinimapInstance>();

  createEffect(() => {
    const svgElement = svg();
    if (svgElement && panZoom) {
      const instance = XYMinimap({
        domNode: svgElement,
        panZoom,
        getTransform: () => store.getState().transform,
        getViewScale: () => dimensions().viewScale,
      });

      setMinimapInstance(instance);

      onCleanup(() => {
        instance.destroy();
      });
    }
  });

  createEffect(() => {
    const instance = minimapInstance();
    if (instance) {
      instance.update({
        translateExtent,
        width: flowWidth,
        height: flowHeight,
        inversePan: props.inversePan,
        pannable: props.pannable ?? false,
        zoomStep: props.zoomStep ?? 10,
        zoomable: props.zoomable ?? false,
      });
    }
  });

  // Handle click events with proper reactivity
  const handleSvgClick = (event: MouseEvent) => {
    if (!props.onClick) return;

    const instance = minimapInstance();
    if (instance) {
      const [x, y] = instance.pointer(event) || [0, 0];
      props.onClick(event, { x, y });
    }
  };

  const handleNodeClick = (event: MouseEvent, nodeId: string) => {
    if (!props.onNodeClick) return;

    const node = store.getState().nodeLookup.get(nodeId)!;
    props.onNodeClick(event, node);
  };

  return (
    <Panel
      position={props.position ?? 'bottom-right'}
      style={{
        ...(props.style || {}),
        '--xy-minimap-background-color-props': typeof props.bgColor === 'string' ? props.bgColor : undefined,
        '--xy-minimap-mask-background-color-props': typeof props.maskColor === 'string' ? props.maskColor : undefined,
        '--xy-minimap-mask-stroke-color-props':
          typeof props.maskStrokeColor === 'string' ? props.maskStrokeColor : undefined,
        '--xy-minimap-mask-stroke-width-props':
          typeof props.maskStrokeWidth === 'number' ? props.maskStrokeWidth * dimensions().viewScale : undefined,
        '--xy-minimap-node-background-color-props': typeof props.nodeColor === 'string' ? props.nodeColor : undefined,
        '--xy-minimap-node-stroke-color-props':
          typeof props.nodeStrokeColor === 'string' ? props.nodeStrokeColor : undefined,
        '--xy-minimap-node-stroke-width-props':
          typeof props.nodeStrokeWidth === 'string' ? props.nodeStrokeWidth : undefined,
      }}
      class={cc(['solid-flow__minimap', props.class])}
      data-testid="rf__minimap"
    >
      <svg
        width={(props.style?.width as number) ?? defaultWidth}
        height={(props.style?.height as number) ?? defaultHeight}
        viewBox={`${dimensions().x} ${dimensions().y} ${dimensions().width} ${dimensions().height}`}
        class="solid-flow__minimap-svg"
        role="img"
        aria-labelledby={labelledBy()}
        ref={setSvgRef}
        onClick={(e) => (props.onClick ? handleSvgClick(e) : undefined)}
      >
        {props.ariaLabel && <title id={labelledBy()}>{props.ariaLabel}</title>}
        <MiniMapNodes
          onClick={(e, nodeId) => (props.onNodeClick ? handleNodeClick(e, nodeId) : undefined)}
          nodeColor={props.nodeColor}
          nodeStrokeColor={props.nodeStrokeColor}
          nodeBorderRadius={props.nodeBorderRadius}
          nodeClass={props.nodeClass}
          nodeStrokeWidth={props.nodeStrokeWidth}
          nodeComponent={props.nodeComponent}
        />
        <path
          class="solid-flow__minimap-mask"
          d={`M${dimensions().x - dimensions().offset},${dimensions().y - dimensions().offset}h${dimensions().width + dimensions().offset * 2}v${dimensions().height + dimensions().offset * 2}h${-dimensions().width - dimensions().offset * 2}z
        M${viewBB.x},${viewBB.y}h${viewBB.width}v${viewBB.height}h${-viewBB.width}z`}
          fill-rule="evenodd"
          pointer-events="none"
        />
      </svg>
    </Panel>
  );
}

export { MiniMap };

/**
 * The `<MiniMap />` component can be used to render an overview of your flow. It
 * renders each node as an SVG element and visualizes where the current viewport is
 * in relation to the rest of the flow.
 *
 * @public
 * @example
 *
 * ```jsx
 *import { SolidFlow, MiniMap } from '@xyflow/solid';
 *
 *export default function Flow() {
 *  return (
 *    <SolidFlow nodes={[...]]} edges={[...]]}>
 *      <MiniMap nodeStrokeWidth={3} />
 *    </SolidFlow>
 *  );
 *}
 *```
 */
