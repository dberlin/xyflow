import { createEffect } from 'solid-js';
import type { Viewport } from '@xyflow/system';

import { useStore, useStoreApi } from './useStore';
import type { SolidFlowStore } from '../types';

const selector = (state: SolidFlowStore) => state.panZoom?.syncViewport;

/**
 * Hook for syncing the viewport with the panzoom instance.
 *
 * @internal
 * @param viewport
 */
export function useViewportSync(viewport?: Viewport) {
  const syncViewport = useStore(selector);
  const store = useStoreApi();

  createEffect(() => {
    if (viewport) {
      syncViewport?.(viewport);
      store.setState({ transform: [viewport.x, viewport.y, viewport.zoom] });
    }
  });

  return null;
}
