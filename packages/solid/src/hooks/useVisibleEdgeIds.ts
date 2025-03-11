import { isEdgeVisible } from '@xyflow/system';

import { useStore } from './useStore';
import { type SolidFlowStore } from '../types';

/**
 * Hook for getting the visible edge ids from the store.
 *
 * @internal
 * @param onlyRenderVisible
 * @returns array with visible edge ids
 */
export function useVisibleEdgeIds(onlyRenderVisible: boolean): string[] {
  // Define the selector function that will be used with useStore
  const selectorFn = (s: SolidFlowStore) => {
    if (!onlyRenderVisible) {
      return s.edges.map((edge) => edge.id);
    }

    const visibleEdgeIds = [];

    if (s.width && s.height) {
      for (const edge of s.edges) {
        const sourceNode = s.nodeLookup.get(edge.source);
        const targetNode = s.nodeLookup.get(edge.target);

        if (
          sourceNode &&
          targetNode &&
          isEdgeVisible({
            sourceNode,
            targetNode,
            width: s.width,
            height: s.height,
            transform: s.transform,
          })
        ) {
          visibleEdgeIds.push(edge.id);
        }
      }
    }

    return visibleEdgeIds;
  };

  // Use the selector function with useStore
  return useStore(selectorFn);
}
