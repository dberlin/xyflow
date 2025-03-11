import { type PanZoomInstance, XYMinimap, type XYMinimapUpdate } from '@xyflow/system';
import type { SolidFlowStore } from '../../store/types';
import { createEffect, onCleanup } from 'solid-js';

export type UseInteractiveParams = {
  panZoom: PanZoomInstance;
  store: SolidFlowStore;
  getViewScale: () => number;
} & XYMinimapUpdate;

export default function interactive(domNode: Element, params: UseInteractiveParams) {
  const minimap = XYMinimap({
    domNode,
    panZoom: params.panZoom,
    getTransform: () => {
      const { viewport } = params.store;
      return [viewport.x, viewport.y, viewport.zoom];
    },
    getViewScale: params.getViewScale,
  });

  function update(params: UseInteractiveParams) {
    minimap.update({
      translateExtent: params.translateExtent,
      width: params.width,
      height: params.height,
      inversePan: params.inversePan,
      zoomStep: params.zoomStep,
      pannable: params.pannable,
      zoomable: params.zoomable,
    });
  }
  // Used to use update rune
  createEffect(() => update(params));
  onCleanup(() => minimap.destroy());
}
