import { Component, createMemo, For, mergeProps, Show } from 'solid-js';
import { getBoundsOfRects, getInternalNodesBounds, getNodeDimensions, nodeHasDimensions } from '@xyflow/system';

import { useStore } from '../../store';
import { Panel } from '../../container/Panel';
import { MinimapNode } from './MinimapNode';
import interactive from './interactive';
import type { GetMiniMapNodeAttribute, MiniMapProps } from './types';
import { filterUndefinedStyles } from '../../utils';
import cc from 'classcat';

declare const window: Window & {
  chrome?: unknown;
};

// Helper function to get node attribute function
const getAttrFunction = (func: unknown): GetMiniMapNodeAttribute => {
  if (typeof func === 'function') {
    return func as GetMiniMapNodeAttribute;
  }
  return () => func as string;
};

const Minimap: Component<MiniMapProps> = (props) => {
  const defaultProps = {
    position: 'bottom-right',
    ariaLabel: 'Mini map',
    nodeStrokeColor: 'transparent',
    nodeClass: '',
    nodeBorderRadius: 5,
    nodeStrokeWidth: 2,
    width: 200,
    height: 150,
    pannable: true,
    zoomable: true,
    style: '',
  } as const;

  const merged = mergeProps(defaultProps, props);

  const store = useStore();
  const shapeRendering = typeof window === 'undefined' || !!window.chrome ? 'crispEdges' : 'geometricPrecision';

  const nodeColorFunc = createMemo(() =>
    merged.nodeColor === undefined ? undefined : getAttrFunction(merged.nodeColor)
  );
  const nodeStrokeColorFunc = createMemo(() => getAttrFunction(merged.nodeStrokeColor));
  const nodeClassFunc = createMemo(() => getAttrFunction(merged.nodeClass));

  const labelledBy = createMemo(() => `solid-flow__minimap-desc-${store.flowId}`);

  const viewBB = createMemo(() => ({
    x: -store.viewport.x / store.viewport.zoom,
    y: -store.viewport.y / store.viewport.zoom,
    width: store.width / store.viewport.zoom,
    height: store.height / store.viewport.zoom,
  }));

  const boundingRect = createMemo(() =>
    store.nodeLookup.size > 0 ? getBoundsOfRects(getInternalNodesBounds(store.nodeLookup), viewBB()) : viewBB()
  );

  const scaledWidth = createMemo(() => boundingRect().width / merged.width);
  const scaledHeight = createMemo(() => boundingRect().height / merged.height);
  const viewScale = createMemo(() => Math.max(scaledWidth(), scaledHeight()));
  const viewWidth = createMemo(() => viewScale() * merged.width);
  const viewHeight = createMemo(() => viewScale() * merged.height);
  const offset = createMemo(() => 5 * viewScale());
  const x = createMemo(() => boundingRect().x - (viewWidth() - boundingRect().width) / 2 - offset());
  const y = createMemo(() => boundingRect().y - (viewHeight() - boundingRect().height) / 2 - offset());
  const viewboxWidth = createMemo(() => viewWidth() + offset() * 2);
  const viewboxHeight = createMemo(() => viewHeight() + offset() * 2);

  const getViewScale = () => viewScale();

  return (
    <Panel
      position={merged.position}
      style={merged.style + (merged.bgColor ? `;--xy-minimap-background-color-props:${merged.bgColor}` : '')}
      class={cc(['solid-flow__minimap', merged.class])}
      data-testid="solid-flow__minimap"
    >
      {store.panZoom && (
        <svg
          width={merged.width}
          height={merged.height}
          viewBox={`${x()} ${y()} ${viewboxWidth()} ${viewboxHeight()}`}
          class="solid-flow__minimap-svg"
          role="img"
          aria-labelledby={labelledBy()}
          style={filterUndefinedStyles([
            ['--xy-minimap-mask-background-color-props', merged.maskColor],
            ['--xy-minimap-mask-stroke-color-props', merged.maskStrokeColor],
            [
              '--xy-minimap-mask-stroke-width-props',
              merged.maskStrokeWidth ? merged.maskStrokeWidth * viewScale() : undefined,
            ],
          ])}
          ref={(el) => {
            if (el) {
              interactive(el, {
                store,
                panZoom: store.panZoom,
                getViewScale,
                translateExtent: store.translateExtent,
                width: store.width,
                height: store.height,
                inversePan: merged.inversePan,
                zoomStep: merged.zoomStep,
                pannable: merged.pannable,
                zoomable: merged.zoomable,
              });
            }
          }}
        >
          <Show when={merged.ariaLabel}>
            <title id={labelledBy()}>{merged.ariaLabel}</title>
          </Show>
          <For each={store.nodes}>
            {(userNode) => {
              const node = store.nodeLookup.get(userNode.id);
              if (node && nodeHasDimensions(node)) {
                const nodeDimensions = getNodeDimensions(node);
                return (
                  <MinimapNode
                    x={node.internals.positionAbsolute.x}
                    y={node.internals.positionAbsolute.y}
                    width={nodeDimensions.width}
                    height={nodeDimensions.height}
                    selected={node.selected}
                    color={nodeColorFunc() ? nodeColorFunc()(node) : undefined}
                    borderRadius={merged.nodeBorderRadius}
                    strokeColor={nodeStrokeColorFunc()(node)}
                    strokeWidth={merged.nodeStrokeWidth}
                    shapeRendering={shapeRendering as 'crispEdges' | 'geometricPrecision'}
                    class={nodeClassFunc()(node)}
                  />
                );
              }
              return null;
            }}
          </For>
          <path
            class="solid-flow__minimap-mask"
            d={`M${x() - offset()},${y() - offset()}h${viewboxWidth() + offset() * 2}v${
              viewboxHeight() + offset() * 2
            }h${-viewboxWidth() - offset() * 2}z
            M${viewBB().x},${viewBB().y}h${viewBB().width}v${viewBB().height}h${-viewBB().width}z`}
            fill-rule="evenodd"
            pointer-events="none"
          />
        </svg>
      )}
    </Panel>
  );
};

export default Minimap;
