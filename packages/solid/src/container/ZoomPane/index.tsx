import type { JSX } from 'solid-js';
import { children, Component, createEffect, createSignal, onCleanup, splitProps } from 'solid-js';
import { PanOnScrollMode, type PanZoomInstance, type Transform, XYPanZoom } from '@xyflow/system';

import { useKeyPress } from '../../hooks/useKeyPress';
import { useResizeHandler } from '../../hooks/useResizeHandler';
import { useStore, useStoreApi } from '../../hooks/useStore';
import { containerStyle } from '../../styles/utils';
import type { FlowRendererProps } from '../FlowRenderer';
import type { SolidFlowStore } from '../../types';

type ZoomPaneProps = Omit<
  FlowRendererProps,
  | 'deleteKeyCode'
  | 'selectionKeyCode'
  | 'multiSelectionKeyCode'
  | 'noDragClass'
  | 'disableKeyboardA11y'
  | 'selectionOnDrag'
> & {
  isControlledViewport: boolean;
  children?: JSX.Element;
};

const selector = (s: SolidFlowStore) => ({
  userSelectionActive: s.userSelectionActive,
  lib: s.lib,
});

export const ZoomPane: Component<ZoomPaneProps> = (props) => {
  const [local] = splitProps(props, [
    'onPaneContextMenu',
    'zoomOnScroll',
    'zoomOnPinch',
    'panOnScroll',
    'panOnScrollSpeed',
    'panOnScrollMode',
    'zoomOnDoubleClick',
    'panOnDrag',
    'defaultViewport',
    'translateExtent',
    'minZoom',
    'maxZoom',
    'zoomActivationKeyCode',
    'preventScrolling',
    'children',
    'noWheelClass',
    'noPanClass',
    'onViewportChange',
    'isControlledViewport',
    'paneClickDistance',
  ]);

  const store = useStoreApi();
  const [zoomPane, setZoomPane] = createSignal<HTMLDivElement | undefined>(undefined);
  const { userSelectionActive, lib } = useStore(selector);
  const resolved = children(() => local.children);

  const [panZoom, setPanZoom] = createSignal<PanZoomInstance | undefined>(undefined);

  useResizeHandler({
    get current() {
      return zoomPane();
    },
  });

  const onTransformChange = (transform: Transform) => {
    local.onViewportChange?.({ x: transform[0], y: transform[1], zoom: transform[2] });

    if (!local.isControlledViewport) {
      store.setState({ transform });
    }
  };

  createEffect(() => {
    if (zoomPane()) {
      const panZoomInstance = XYPanZoom({
        domNode: zoomPane(),
        minZoom: local.minZoom,
        maxZoom: local.maxZoom,
        translateExtent: local.translateExtent,
        viewport: local.defaultViewport,
        paneClickDistance: local.paneClickDistance,
        onDraggingChange: (paneDragging: boolean) => store.setState({ paneDragging }),
        onPanZoomStart: (event, vp) => {
          const { onViewportChangeStart, onMoveStart } = store.getState();
          onMoveStart?.(event, vp);
          onViewportChangeStart?.(vp);
        },
        onPanZoom: (event, vp) => {
          const { onViewportChange, onMove } = store.getState();
          onMove?.(event, vp);
          onViewportChange?.(vp);
        },
        onPanZoomEnd: (event, vp) => {
          const { onViewportChangeEnd, onMoveEnd } = store.getState();
          onMoveEnd?.(event, vp);
          onViewportChangeEnd?.(vp);
        },
      });

      const { x, y, zoom } = panZoomInstance.getViewport();

      store.setState({
        panZoom: panZoomInstance,
        transform: [x, y, zoom],
        domNode: zoomPane()?.closest('.solid-flow') as HTMLDivElement,
      });

      // Store the panZoom instance in a signal that can be accessed by other effects
      setPanZoom(panZoomInstance);

      onCleanup(() => {
        panZoomInstance?.destroy();
      });
    }
  });

  // Track changes to props and update the panZoom instance
  createEffect(() => {
    const instance = panZoom();
    if (instance) {
      instance.update({
        onPaneContextMenu: local.onPaneContextMenu,
        zoomOnScroll: local.zoomOnScroll ?? true,
        zoomOnPinch: local.zoomOnPinch ?? true,
        panOnScroll: local.panOnScroll ?? false,
        panOnScrollSpeed: local.panOnScrollSpeed ?? 0.5,
        panOnScrollMode: local.panOnScrollMode ?? PanOnScrollMode.Free,
        zoomOnDoubleClick: local.zoomOnDoubleClick ?? true,
        panOnDrag: local.panOnDrag ?? true,
        zoomActivationKeyPressed: useKeyPress(local.zoomActivationKeyCode)(),
        preventScrolling: local.preventScrolling ?? true,
        userSelectionActive,
        lib,
        onTransformChange,
        noWheelClassName: local.noWheelClass ?? '',
        noPanClassName: local.noPanClass ?? '',
      });
    }
  });

  return (
    <div class="solid-flow__renderer" ref={setZoomPane} style={containerStyle as JSX.CSSProperties}>
      {resolved()}
    </div>
  );
};
