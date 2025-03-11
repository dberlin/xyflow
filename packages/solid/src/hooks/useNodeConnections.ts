import { Accessor, createEffect, createSignal } from 'solid-js';
import { Connection, errorMessages, handleConnectionChange, HandleType, NodeConnection } from '@xyflow/system';

import { useStore } from './useStore';
import { useNodeId } from '../contexts/NodeIdContext';

const error014 = errorMessages['error014']();

type UseNodeConnectionsParams = {
  id?: string;
  handleType?: HandleType;
  handleId?: string;
  onConnect?: (connections: Connection[]) => void;
  onDisconnect?: (connections: Connection[]) => void;
};

/**
 * This hook returns an array of connections on a specific node, handle type ('source', 'target') or handle ID.
 *
 * @public
 * @param param.id - node id - optional if called inside a custom node
 * @param param.handleType - filter by handle type 'source' or 'target'
 * @param param.handleId - filter by handle id (this is only needed if the node has multiple handles of the same type)
 * @param param.onConnect - gets called when a connection is established
 * @param param.onDisconnect - gets called when a connection is removed
 * @returns a function that returns an array with connections
 *
 * @example
 * ```jsx
 *import { useNodeConnections } from '@xyflow/solid';
 *
 *export default function () {
 *  const connections = useNodeConnections({
 *    handleType: 'target',
 *    handleId: 'my-handle',
 *  });
 *
 *  return (
 *    <div>There are currently {connections().length} incoming connections!</div>
 *  );
 *}
 *```
 */
export function useNodeConnections({
  id,
  handleType,
  handleId,
  onConnect,
  onDisconnect,
}: UseNodeConnectionsParams = {}): Accessor<NodeConnection[]> {
  const nodeId = useNodeId();
  const currentNodeId = id ?? nodeId;

  if (!currentNodeId) {
    throw new Error(error014);
  }

  const [prevConnections, setPrevConnections] = createSignal<Map<string, NodeConnection> | null>(null);

  const connections = useStore(
    (state) =>
      state.connectionLookup.get(
        `${currentNodeId}${handleType ? (handleId ? `-${handleType}-${handleId}` : `-${handleType}`) : ''}`
      ) /* FIXME: Check this, areConnectionMapsEqual*/
  );

  createEffect(() => {
    // @todo dicuss if onConnect/onDisconnect should be called when the component mounts/unmounts
    if (prevConnections() && prevConnections() !== connections) {
      const _connections = connections ?? new Map();
      handleConnectionChange(prevConnections()!, _connections, onDisconnect);
      handleConnectionChange(_connections, prevConnections()!, onConnect);
    }

    setPrevConnections(connections ?? new Map());
  });

  return () => Array.from(connections?.values() ?? []);
}
