import { useStore } from '../store';

import type { ConnectionState } from '@xyflow/system';

/**
 * Hook for receiving the current connection.
 *
 * @public
 * @returns current connection as a readable store
 */
export function useConnection(): { current: ConnectionState } {
  const store = useStore();

  return {
    get current() {
      return store.connection;
    },
  };
}
