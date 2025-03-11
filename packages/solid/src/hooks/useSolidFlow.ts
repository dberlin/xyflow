import {
  EdgeRemoveChange,
  evaluateAbsolutePosition,
  getElementsToRemove,
  getNodesBounds,
  getOverlappingArea,
  isRectObject,
  NodeRemoveChange,
  nodeToRect,
  type Rect,
} from '@xyflow/system';

import useViewportHelper from './useViewportHelper';
import { useStore, useStoreApi } from './useStore';
import { elementToRemoveChange, isEdge, isNode } from '../utils';
import type { Edge, InternalNode, Node, SolidFlowInstance, SolidFlowStore } from '../types';

const selector = (s: SolidFlowStore) => !!s.panZoom;

/**
 * This hook returns a SolidFlowInstance that can be used to update nodes and edges, manipulate the viewport, or query the current state of the flow.
 *
 * @public
 * @returns SolidFlowInstance
 *
 * @example
 * ```jsx
 *import { createSignal } from 'solid-js';
 *import { useSolidFlow } from '@xyflow/solid';
 *
 *export function NodeCounter() {
 *  const solidFlow = useSolidFlow();
 *  const [count, setCount] = createSignal(0);
 *  const countNodes = () => {
 *    setCount(solidFlow.getNodes().length);
 *    // you need to pass it as a dependency if you are using it with createEffect or similar
 *    // because at the first render, it's not initialized yet and some functions might not work.
 *  };
 *
 *  return (
 *    <div>
 *      <button onClick={countNodes}>Update count</button>
 *      <p>There are {count()} nodes in the flow.</p>
 *    </div>
 *  );
 *}
 *```
 */
export function useSolidFlow<NodeType extends Node = Node, EdgeType extends Edge = Edge>(): SolidFlowInstance<
  NodeType,
  EdgeType
> {
  const viewportHelper = useViewportHelper();
  const store = useStoreApi();
  // const batchContext = useBatchContext();
  const viewportInitialized = useStore(selector);

  // Create a non-reactive object with the same properties as generalHelper
  const helpers = {
    getInternalNode: (id: string) => store.getState().nodeLookup.get(id) as InternalNode<NodeType>,

    setNodes: (payload: NodeType[] | ((nodes: NodeType[]) => NodeType[])) => {
      store.getActions().setNodes(payload as NodeType[]);
      // batchContext.nodeQueue.push(payload as NodeType[]);
    },

    setEdges: (payload: EdgeType[] | ((edges: EdgeType[]) => EdgeType[])) => {
      store.getActions().setEdges(payload as EdgeType[]);
      // batchContext.edgeQueue.push(payload as EdgeType[]);
    },

    getNodeRect: (node: NodeType | { id: string }): Rect | null => {
      const { nodeLookup, nodeOrigin } = store.getState();

      const nodeToUse = isNode<NodeType>(node) ? node : nodeLookup.get(node.id)!;
      const position = nodeToUse.parentId
        ? evaluateAbsolutePosition(nodeToUse.position, nodeToUse.measured, nodeToUse.parentId, nodeLookup, nodeOrigin)
        : nodeToUse.position;

      const nodeWithPosition = {
        ...nodeToUse,
        position,
        width: nodeToUse.measured?.width ?? nodeToUse.width,
        height: nodeToUse.measured?.height ?? nodeToUse.height,
      };

      return nodeToRect(nodeWithPosition);
    },

    updateNode: (
      id: string,
      nodeUpdate: ((node: NodeType) => Partial<NodeType> | NodeType) | Partial<NodeType>,
      options = { replace: false }
    ) => {
      helpers.setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === id) {
            const nextNode = typeof nodeUpdate === 'function' ? nodeUpdate(node) : nodeUpdate;
            return options.replace && isNode(nextNode) ? (nextNode as NodeType) : { ...node, ...nextNode };
          }

          return node;
        })
      );
    },

    updateEdge: (
      id: string,
      edgeUpdate: ((edge: EdgeType) => Partial<EdgeType> | EdgeType) | Partial<EdgeType>,
      options = { replace: false }
    ) => {
      helpers.setEdges((prevEdges) =>
        prevEdges.map((edge) => {
          if (edge.id === id) {
            const nextEdge = typeof edgeUpdate === 'function' ? edgeUpdate(edge) : edgeUpdate;
            return options.replace && isEdge(nextEdge) ? (nextEdge as EdgeType) : { ...edge, ...nextEdge };
          }

          return edge;
        })
      );
    },

    getNodes: () => store.getState().nodes.map((n) => ({ ...n })) as NodeType[],
    getNode: (id: string) => helpers.getInternalNode(id)?.internals.userNode as NodeType,
    getEdges: () => {
      const { edges = [] } = store.getState();
      return edges.map((e) => ({ ...e })) as EdgeType[];
    },
    getEdge: (id: string) => store.getState().edgeLookup.get(id) as EdgeType,
    addNodes: (payload: NodeType | NodeType[]) => {
      const newNodes = Array.isArray(payload) ? payload : [payload];
      store.getActions().setNodes([...store.getState().nodes, ...newNodes]);
      // batchContext.nodeQueue.push((nodes) => [...nodes, ...newNodes]);
    },
    addEdges: (payload: EdgeType | EdgeType[]) => {
      const newEdges = Array.isArray(payload) ? payload : [payload];
      store.getActions().setEdges([...store.getState().edges, ...newEdges]);
      // batchContext.edgeQueue.push((edges) => [...edges, ...newEdges]);
    },
    toObject: () => {
      const { nodes = [], edges = [], transform } = store.getState();
      const [x, y, zoom] = transform;
      return {
        nodes: nodes.map((n) => ({ ...n })) as NodeType[],
        edges: edges.map((e) => ({ ...e })) as EdgeType[],
        viewport: {
          x,
          y,
          zoom,
        },
      };
    },
    deleteElements: async ({ nodes: nodesToRemove = [], edges: edgesToRemove = [] }) => {
      const { nodes, edges, onNodesDelete, onEdgesDelete, onDelete, onBeforeDelete } = store.getState();
      const { triggerNodeChanges, triggerEdgeChanges } = store.getActions();
      const { nodes: matchingNodes, edges: matchingEdges } = await getElementsToRemove({
        nodesToRemove,
        edgesToRemove,
        nodes,
        edges,
        onBeforeDelete,
      });

      const hasMatchingEdges = matchingEdges.length > 0;
      const hasMatchingNodes = matchingNodes.length > 0;

      if (hasMatchingEdges) {
        const edgeChanges: EdgeRemoveChange[] = matchingEdges.map(elementToRemoveChange);

        onEdgesDelete?.(matchingEdges);
        triggerEdgeChanges(edgeChanges);
      }

      if (hasMatchingNodes) {
        const nodeChanges: NodeRemoveChange[] = matchingNodes.map(elementToRemoveChange);

        onNodesDelete?.(matchingNodes);
        triggerNodeChanges(nodeChanges);
      }

      if (hasMatchingNodes || hasMatchingEdges) {
        onDelete?.({ nodes: matchingNodes, edges: matchingEdges });
      }

      return { deletedNodes: matchingNodes, deletedEdges: matchingEdges };
    },
    getIntersectingNodes: (nodeOrRect: NodeType | Rect, partially = true, nodes?: NodeType[]) => {
      const isRect = isRectObject(nodeOrRect);
      const nodeRect = isRect ? nodeOrRect : helpers.getNodeRect(nodeOrRect);
      const hasNodesOption = nodes !== undefined;

      if (!nodeRect) {
        return [];
      }

      return (nodes || store.getState().nodes).filter((n) => {
        const internalNode = store.getState().nodeLookup.get(n.id);

        if (internalNode && !isRect && (n.id === nodeOrRect.id || !internalNode.internals.positionAbsolute)) {
          return false;
        }

        const currNodeRect = nodeToRect(hasNodesOption ? n : internalNode!);
        const overlappingArea = getOverlappingArea(currNodeRect, nodeRect);
        const partiallyVisible = partially && overlappingArea > 0;

        return partiallyVisible || overlappingArea >= nodeRect.width * nodeRect.height;
      }) as NodeType[];
    },
    isNodeIntersecting: (nodeOrRect: NodeType | Rect, area: Rect, partially = true) => {
      const isRect = isRectObject(nodeOrRect);
      const nodeRect = isRect ? nodeOrRect : helpers.getNodeRect(nodeOrRect);

      if (!nodeRect) {
        return false;
      }

      const overlappingArea = getOverlappingArea(nodeRect, area);
      const partiallyVisible = partially && overlappingArea > 0;

      return partiallyVisible || overlappingArea >= nodeRect.width * nodeRect.height;
    },
    updateNodeData: (id: string, dataUpdate: unknown, options = { replace: false }) => {
      helpers.updateNode(
        id,
        (node) => {
          const nextData = typeof dataUpdate === 'function' ? dataUpdate(node) : dataUpdate;
          return options.replace ? { ...node, data: nextData } : { ...node, data: { ...node.data, ...nextData } };
        },
        options
      );
    },
    updateEdgeData: (id: string, dataUpdate: unknown, options = { replace: false }) => {
      helpers.updateEdge(
        id,
        (edge) => {
          const nextData = typeof dataUpdate === 'function' ? dataUpdate(edge) : dataUpdate;
          return options.replace ? { ...edge, data: nextData } : { ...edge, data: { ...edge.data, ...nextData } };
        },
        options
      );
    },
    getNodesBounds: (nodes?: NodeType[]) => getNodesBounds(nodes || store.getState().nodes),
    getHandleConnections: ({ type, id, nodeId }: { type: string; id?: string; nodeId: string }) =>
      Array.from(
        store
          .getState()
          .connectionLookup.get(`${nodeId}-${type}${id ? `-${id}` : ''}`)
          ?.values() ?? []
      ),
    getNodeConnections: ({ type, handleId, nodeId }: { type?: string; handleId?: string; nodeId: string }) =>
      Array.from(
        store
          .getState()
          .connectionLookup.get(`${nodeId}${type ? (handleId ? `-${type}-${handleId}` : `-${type}`) : ''}`)
          ?.values() ?? []
      ),
  };

  return {
    ...viewportHelper,
    ...helpers,
    viewportInitialized,
  };
}
