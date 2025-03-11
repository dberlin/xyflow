import { areConnectionMapsEqual, type HandleType, type NodeConnection } from '@xyflow/system';
import { createMemo, useContext } from 'solid-js';
import { useStore } from '../store';
import { NodeIdContext } from '../types/contexts';

type UseNodeConnectionsParams = {
  id?: string;
  handleType?: HandleType;
  handleId?: string;
  // TODO: Svelte 5
  //   onConnect?: (connections: Connection[]) => void;
  //   onDisconnect?: (connections: Connection[]) => void;
};

const initialConnections: NodeConnection[] = [];

/**
 * Hook to retrieve all edges connected to a node. Can be filtered by handle type and id.
 *
 * @public
 * @param param.id - node id - optional if called inside a custom node
 * @param param.handleType - filter by handle type 'source' or 'target'
 * @param param.handleId - filter by handle id (this is only needed if the node has multiple handles of the same type)
 * @todo @param param.onConnect - gets called when a connection is established
 * @todo @param param.onDisconnect - gets called when a connection is removed
 * @returns an array with connections
 */
export function useNodeConnections({ id, handleType, handleId }: UseNodeConnectionsParams = {}) {
  const store = useStore();

  const contextNodeId = useContext(NodeIdContext);
  const nodeId = id ?? contextNodeId;

  let prevConnections: Map<string, NodeConnection> | undefined = new Map();
  let connectionsArray: NodeConnection[] = initialConnections;

  const connections = createMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    store.edges;
    const nextConnections = store.connectionLookup.get(
      `${nodeId}${handleType ? (handleId ? `-${handleType}-${handleId}` : `-${handleType}`) : ''}`
    );
    if (!areConnectionMapsEqual(nextConnections, prevConnections)) {
      prevConnections = nextConnections;
      connectionsArray = Array.from(nextConnections?.values() || initialConnections);
    }
    return connectionsArray;
  });

  return {
    get current() {
      return connections;
    },
  };
}
