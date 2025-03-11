import { PanOnScrollMode, type PanZoomInstance, type Transform } from '@xyflow/system';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { ZoomProps } from './types';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import zoom from '../../actions/zoom';
import { Component, createMemo, onMount, untrack } from 'solid-js';
import './Zoom.css';

export const Zoom: Component<ZoomProps> = (props) => {
  const panOnDragActive = createMemo(() => props.store.panActivationKeyPressed || props.panOnDrag);
  const panOnScrollActive = createMemo(() => props.store.panActivationKeyPressed || props.panOnScroll);

  const onTransformChange = (transform: Transform) =>
    (props.store.viewport = { x: transform[0], y: transform[1], zoom: transform[2] });

  // Deliberately extract the initial value by destructuring
  const initialViewport = untrack(() => props.store.viewport);
  onMount(() => {
    props.store.viewportInitialized = true;
  });
  return (
    <div
      class="solid-flow__zoom"
      use:zoom={{
        viewport: props.store.viewport,
        minZoom: props.store.minZoom,
        maxZoom: props.store.maxZoom,
        initialViewport,
        onDraggingChange: (dragging: boolean) => {
          props.store.dragging = dragging;
        },
        setPanZoomInstance: (instance: PanZoomInstance) => {
          props.store.panZoom = instance;
        },
        onPanZoomStart: props.onMoveStart,
        onPanZoom: props.onMove,
        onPanZoomEnd: props.onMoveEnd,
        zoomOnScroll: props.zoomOnScroll,
        zoomOnDoubleClick: props.zoomOnDoubleClick,
        zoomOnPinch: props.zoomOnPinch,
        panOnScroll: panOnScrollActive(),
        panOnDrag: panOnDragActive(),
        panOnScrollSpeed: 0.5,
        panOnScrollMode: props.panOnScrollMode || PanOnScrollMode.Free,
        zoomActivationKeyPressed: props.store.zoomActivationKeyPressed,
        preventScrolling: typeof props.preventScrolling === 'boolean' ? props.preventScrolling : true,
        noPanClassName: 'nopan',
        noWheelClassName: 'nowheel',
        userSelectionActive: !!props.store.selectionRect,
        translateExtent: props.store.translateExtent,
        lib: 'solid',
        paneClickDistance: props.paneClickDistance,
        onTransformChange,
      }}
    >
      {props.children}
    </div>
  );
};
