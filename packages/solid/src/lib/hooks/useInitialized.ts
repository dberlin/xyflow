import { useStore } from '../store';

/**
 * Hook for seeing if nodes are initialized
 * @returns - reactive nodesInitialized
 */
export function useNodesInitialized() {
  const store = useStore();
  return {
    get current() {
      return store.nodesInitialized;
    },
  };
}

/**
 * Hook for seeing if the flow is initialized
 * @returns - reactive initialized
 */
export function useInitialized() {
  const store = useStore();
  return {
    get current() {
      return store.initialized;
    },
  };
}
