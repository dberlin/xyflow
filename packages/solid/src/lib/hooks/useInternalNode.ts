import { createMemo } from 'solid-js';
import { useStore } from '../store';
import type { InternalNode } from '../types';

/**
 * Hook to get an internal node by id.
 *
 * @public
 * @param id - the node id
 * @returns a readable with an internal node or undefined
 */
export function useInternalNode(id: string): { current: InternalNode | undefined } {
  const store = useStore();

  const node = createMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    store.nodes;
    return store.nodeLookup.get(id);
  });

  return {
    get current() {
      return node();
    },
  };
}
