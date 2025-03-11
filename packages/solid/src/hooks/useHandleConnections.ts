import { Accessor, createEffect, createSignal } from 'solid-js';
import { Connection, HandleConnection, handleConnectionChange, HandleType } from '@xyflow/system';

import { useStore } from './useStore';
import { useNodeId } from '../contexts/NodeIdContext';

type UseHandleConnectionsParams = {
  type: HandleType;
  id?: string | null;
  nodeId?: string;
  onConnect?: (connections: Connection[]) => void;
  onDisconnect?: (connections: Connection[]) => void;
};

/**
 * Hook to check if a <Handle /> is connected to another <Handle /> and get the connections.
 *
 * @public
 * @deprecated Use `useNodeConnections` instead.
 * @param params.type - handle type 'source' or 'target'
 * @param params.nodeId - node id - if not provided, the node id from the NodeIdContext is used
 * @param params.id - the handle id (this is only needed if the node has multiple handles of the same type)
 * @param params.onConnect - gets called when a connection is established
 * @param params.onDisconnect - gets called when a connection is removed
 * @returns an array with handle connections
 */
export function useHandleConnections(params: UseHandleConnectionsParams): Accessor<HandleConnection[]> {
  console.warn(
    '[DEPRECATED] `useHandleConnections` is deprecated. Instead use `useNodeConnections` https://solidflow.dev/api-reference/hooks/useNodeConnections'
  );

  const _nodeId = useNodeId();
  const currentNodeId = params.nodeId ?? _nodeId;

  const [prevConnections, setPrevConnections] = createSignal<Map<string, HandleConnection> | null>(null);

  const connections = useStore(
    (state) => state.connectionLookup.get(`${currentNodeId}-${params.type}${params.id ? `-${params.id}` : ''}`)
    /* FIXME: Check this, areConnectionMapsEqual*/
  );

  createEffect(() => {
    // @todo dicuss if onConnect/onDisconnect should be called when the component mounts/unmounts
    if (prevConnections() && prevConnections() !== connections) {
      const _connections = connections ?? new Map();
      handleConnectionChange(prevConnections()!, _connections, params.onDisconnect);
      handleConnectionChange(_connections, prevConnections()!, params.onConnect);
    }

    setPrevConnections(connections ?? new Map());
  });

  return () => Array.from(connections?.values() ?? []);
}
