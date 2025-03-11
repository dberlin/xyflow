import {
  type CoordinateExtent,
  type OnPanZoom,
  PanOnScrollMode,
  type PanZoomInstance,
  type Transform,
  type Viewport,
  XYPanZoom,
} from '@xyflow/system';
import { createEffect } from 'solid-js';

type ZoomParams = {
  viewport: Viewport;
  initialViewport: Viewport;
  minZoom: number;
  maxZoom: number;
  setPanZoomInstance: (panZoomInstance: PanZoomInstance) => void;
  onPanZoomStart?: OnPanZoom;
  onPanZoom?: OnPanZoom;
  onPanZoomEnd?: OnPanZoom;
  onPaneContextMenu?: (event: MouseEvent) => void;
  translateExtent: CoordinateExtent;
  zoomOnScroll: boolean;
  zoomOnPinch: boolean;
  zoomOnDoubleClick: boolean;
  panOnScroll: boolean;
  panOnDrag: boolean | number[];
  panOnScrollSpeed: number;
  panOnScrollMode: PanOnScrollMode;
  zoomActivationKeyPressed: boolean;
  preventScrolling: boolean;
  // last two instances of 'classname' being used
  // changing it to class would require object restructuring for use with panZoomInstance.update
  noPanClassName: string;
  noWheelClassName: string;
  userSelectionActive: boolean;
  lib: string;
  paneClickDistance: number;
  onTransformChange: (transform: Transform) => void;
  onDraggingChange: (dragging: boolean) => void;
};
declare module 'solid-js' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface Directives {
      zoom: ZoomParams;
    }
  }
}

export default function zoom(domNode: Element, params: () => ZoomParams) {
  const panZoomInstance = XYPanZoom({
    domNode,
    minZoom: params().minZoom,
    maxZoom: params().maxZoom,
    translateExtent: params().translateExtent,
    viewport: params().initialViewport,
    paneClickDistance: params().paneClickDistance,
    onDraggingChange: params().onDraggingChange,
  });

  //TODO: is this neccessary?
  const viewport = panZoomInstance.getViewport();
  if (
    params().initialViewport.x !== viewport.x ||
    params().initialViewport.y !== viewport.y ||
    params().initialViewport.zoom !== viewport.zoom
  ) {
    params().onTransformChange([viewport.x, viewport.y, viewport.zoom]);
  }

  params().setPanZoomInstance(panZoomInstance);

  createEffect(() => panZoomInstance.update(params()));

  // Used to return an update function, but solid has no such thing. We use createEffect on the params instead.
}
