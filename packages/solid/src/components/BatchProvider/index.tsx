import { children, type Component, createContext, type JSX, useContext } from 'solid-js';
import type { EdgeChange, NodeChange } from '@xyflow/system';

import { StoreApiType, useStoreApi } from '../../hooks/useStore';
import { getElementsDiffChanges } from '../../utils';
import type { Queue, QueueItem } from './types';
import type { Edge, Node } from '../../types';
import { useQueue } from './useQueue';

export const BatchContext = createContext<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  nodeQueue: Queue<any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  edgeQueue: Queue<any>;
} | null>(null);

/**
 * This is a context provider that holds and processes the node and edge update queues
 * that are needed to handle setNodes, addNodes, setEdges and addEdges.
 *
 * @internal
 */
type BatchProviderProps = {
  children: JSX.Element;
};
export const BatchProvider: Component<BatchProviderProps> = <
  NodeType extends Node = Node,
  EdgeType extends Edge = Edge,
>(
  props
) => {
  const store = useStoreApi<NodeType, EdgeType>();

  const { nodeQueue, edgeQueue } = createQueues<NodeType, EdgeType>(store);

  const resolved = children(() => props.children);
  return <BatchContext.Provider value={{ nodeQueue, edgeQueue }}>{resolved()}</BatchContext.Provider>;
};

export function createQueues<NodeType extends Node = Node, EdgeType extends Edge = Edge>(
  store: StoreApiType<NodeType, EdgeType>
) {
  const nodeQueueHandler = (queueItems: QueueItem<NodeType>[]) => {
    const { nodes = [], hasDefaultNodes, onNodesChange, nodeLookup } = store.getState();
    const { setNodes } = store.getActions();

    /*
     * This is essentially an `Array.reduce` in imperative clothing. Processing
     * this queue is a relatively hot path so we'd like to avoid the overhead of
     * array methods where we can.
     */
    let next = nodes;
    for (const payload of queueItems) {
      next = typeof payload === 'function' ? payload(next) : payload;
    }

    if (hasDefaultNodes) {
      setNodes(next);
    } else if (onNodesChange) {
      onNodesChange(
        getElementsDiffChanges({
          items: next,
          lookup: nodeLookup,
        }) as NodeChange<NodeType>[]
      );
    }
  };
  const nodeQueue = useQueue<NodeType>(nodeQueueHandler);

  const edgeQueueHandler = (queueItems: QueueItem<EdgeType>[]) => {
    const { edges = [], hasDefaultEdges, onEdgesChange, edgeLookup } = store.getState();
    const { setEdges } = store.getActions();

    let next = edges;
    for (const payload of queueItems) {
      next = typeof payload === 'function' ? payload(next) : payload;
    }

    if (hasDefaultEdges) {
      setEdges(next);
    } else if (onEdgesChange) {
      onEdgesChange(
        getElementsDiffChanges({
          items: next,
          lookup: edgeLookup,
        }) as EdgeChange<EdgeType>[]
      );
    }
  };
  const edgeQueue = useQueue<EdgeType>(edgeQueueHandler);
  return { nodeQueue, edgeQueue };
}

export function useBatchContext() {
  const batchContext = useContext(BatchContext);

  if (!batchContext) {
    throw new Error('useBatchContext must be used within a BatchProvider');
  }

  return batchContext;
}
