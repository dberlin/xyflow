import { createMemo } from 'solid-js';
import { getNodesInside } from '@xyflow/system';

import { useStoreApi } from './useStore';
import type { Node } from '../types';

/**
 * Hook for getting the visible node ids from the store.
 *
 * @internal
 * @param onlyRenderVisible
 * @returns array with visible node ids
 */
export function useVisibleNodeIds(onlyRenderVisible: boolean) {
  // Get the store API to access the state directly
  const store = useStoreApi();

  // Create a memo that computes the visible node IDs based on the current state
  const nodeIds = createMemo(() => {
    const state = store.getState();

    return onlyRenderVisible
      ? getNodesInside<Node>(
          state.nodeLookup,
          { x: 0, y: 0, width: state.width, height: state.height },
          state.transform,
          true
        ).map((node) => node.id)
      : Array.from(state.nodeLookup.keys());
  });

  return nodeIds;
}
