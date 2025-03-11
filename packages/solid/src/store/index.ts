import { createStore as createSolidStore, reconcile } from 'solid-js/store';
import {
  adoptUserNodes,
  ConnectionState,
  CoordinateExtent,
  EdgeChange,
  EdgeSelectionChange,
  fitView as fitViewSystem,
  getFitViewNodes,
  handleExpandParent,
  initialConnection,
  InternalNodeUpdate,
  NodeChange,
  NodeOrigin,
  NodeSelectionChange,
  panBy as panBySystem,
  ParentExpandChild,
  updateAbsolutePositions,
  updateConnectionLookup,
  updateNodeInternals as updateNodeInternalsSystem,
  XYPosition,
} from '@xyflow/system';

import { applyEdgeChanges, applyNodeChanges, createSelectionChange, getSelectionChanges } from '../utils';
import getInitialState from './initialState';
import type { Edge, FitViewOptions, InternalNode, Node, SolidFlowStore, UnselectNodesAndEdgesParams } from '../types';

function createStore<NodeType extends Node, EdgeType extends Edge>({
  nodes,
  edges,
  defaultNodes,
  defaultEdges,
  width,
  height,
  fitView,
  nodeOrigin,
  nodeExtent,
}: {
  nodes?: NodeType[];
  edges?: EdgeType[];
  defaultNodes?: NodeType[];
  defaultEdges?: EdgeType[];
  width?: number;
  height?: number;
  fitView?: boolean;
  nodeOrigin?: NodeOrigin;
  nodeExtent?: CoordinateExtent;
}) {
  const [solidStore, setSolidStore] = createSolidStore<SolidFlowStore<NodeType, EdgeType>>({
    ...getInitialState<NodeType, EdgeType>({
      nodes,
      edges,
      width,
      height,
      fitView,
      nodeOrigin,
      nodeExtent,
      defaultNodes,
      defaultEdges,
    }),
  });
  const store = {
    getState: (): SolidFlowStore<NodeType, EdgeType> => solidStore,
    // setState: (state: Partial<SolidFlowStore<NodeType, EdgeType>>) => {
    //   setSolidStore(state);
    // },
    setState: setSolidStore,
    setNodes: (nodes: NodeType[]) => {
      /*
       * setNodes() is called exclusively in response to user actions:
       * - either when the `<SolidFlow nodes>` prop is updated in the controlled SolidFlow setup,
       * - or when the user calls something like `solidFlowInstance.setNodes()` in an uncontrolled SolidFlow setup.
       *
       * When this happens, we take the note objects passed by the user and extend them with fields
       * relevant for internal Solid Flow operations.
       */
      adoptUserNodes(nodes, solidStore.nodeLookup, solidStore.parentLookup, {
        nodeOrigin: solidStore.nodeOrigin,
        nodeExtent: solidStore.nodeExtent,
        elevateNodesOnSelect: solidStore.elevateNodesOnSelect,
        checkEquality: true,
      });

      setSolidStore('nodes', reconcile(nodes));
    },
    setEdges: (edges: EdgeType[]) => {
      updateConnectionLookup(solidStore.connectionLookup, solidStore.edgeLookup, edges);

      setSolidStore('edges', reconcile(edges));
    },
    setDefaultNodesAndEdges: (nodes?: NodeType[], edges?: EdgeType[]) => {
      if (nodes) {
        store.setNodes(nodes);
        setSolidStore('hasDefaultNodes', true);
      }
      if (edges) {
        store.setEdges(edges);
        setSolidStore('hasDefaultEdges', true);
      }
    },
    /*
     * Every node gets registerd at a ResizeObserver. Whenever a node
     * changes its dimensions, this function is called to measure the
     * new dimensions and update the nodes.
     */
    updateNodeInternals: (updates: Map<string, InternalNodeUpdate>, params = { triggerFitView: true }) => {
      const { changes, updatedInternals } = updateNodeInternalsSystem(
        updates,
        solidStore.nodeLookup,
        solidStore.parentLookup,
        solidStore.domNode,
        solidStore.nodeOrigin,
        solidStore.nodeExtent
      );

      if (!updatedInternals) {
        return;
      }

      updateAbsolutePositions(solidStore.nodeLookup, solidStore.parentLookup, {
        nodeOrigin: solidStore.nodeOrigin,
        nodeExtent: solidStore.nodeExtent,
      });

      if (params.triggerFitView) {
        // we call fitView once initially after all dimensions are set
        let nextFitViewDone = solidStore.fitViewDone;

        if (!solidStore.fitViewDone && solidStore.fitViewOnInit) {
          nextFitViewDone = store.fitViewSync({
            ...solidStore.fitViewOnInitOptions,
            nodes: solidStore.fitViewOnInitOptions?.nodes,
          });
        }

        /*
         * here we are cirmumventing the onNodesChange handler
         * in order to be able to display nodes even if the user
         * has not provided an onNodesChange handler.
         * Nodes are only rendered if they have a width and height
         * attribute which they get from this handler.
         */
        setSolidStore('fitViewDone', nextFitViewDone);
      } else {
        // we always want to trigger useStore calls whenever updateNodeInternals is called
        // set({});
        // FIXME: Check if this is needed
      }

      if (changes?.length > 0) {
        if (solidStore.debug) {
          console.log('Solid Flow: trigger node changes', changes);
        }
        store.triggerNodeChanges?.(changes);
      }
    },
    updateNodePositions: (nodeDragItems: Map<string, InternalNode<NodeType>>, dragging = false) => {
      const parentExpandChildren: ParentExpandChild[] = [];
      const changes = [];

      for (const [id, dragItem] of nodeDragItems) {
        // we are using the nodelookup to be sure to use the current expandParent and parentId value
        const node = solidStore.nodeLookup.get(id);
        const expandParent = !!(node?.expandParent && node?.parentId && dragItem?.position);

        const change: NodeChange = {
          id,
          type: 'position',
          position: expandParent
            ? {
                x: Math.max(0, dragItem.position.x),
                y: Math.max(0, dragItem.position.y),
              }
            : dragItem.position,
          dragging,
        };

        if (expandParent && node.parentId) {
          parentExpandChildren.push({
            id,
            parentId: node.parentId,
            rect: {
              ...dragItem.internals.positionAbsolute,
              width: dragItem.measured.width ?? 0,
              height: dragItem.measured.height ?? 0,
            },
          });
        }

        changes.push(change);
      }

      if (parentExpandChildren.length > 0) {
        const parentExpandChanges = handleExpandParent(
          parentExpandChildren,
          solidStore.nodeLookup,
          solidStore.parentLookup,
          solidStore.nodeOrigin
        );
        changes.push(...parentExpandChanges);
      }

      store.triggerNodeChanges(changes);
    },
    triggerNodeChanges: (changes: NodeChange<NodeType>[] | undefined) => {
      if (changes?.length) {
        if (solidStore.hasDefaultNodes) {
          const updatedNodes = applyNodeChanges(changes, solidStore.nodes);
          store.setNodes(updatedNodes);
        }

        if (solidStore.debug) {
          console.log('Solid Flow: trigger node changes', changes);
        }

        solidStore.onNodesChange?.(changes);
      }
    },
    triggerEdgeChanges: (changes: EdgeChange<EdgeType>[] | undefined) => {
      if (changes?.length) {
        if (solidStore.hasDefaultEdges) {
          const updatedEdges = applyEdgeChanges(changes, solidStore.edges);
          store.setEdges(updatedEdges);
        }

        if (solidStore.debug) {
          console.log('Solid Flow: trigger edge changes', changes);
        }

        solidStore.onEdgesChange?.(changes);
      }
    },
    addSelectedNodes: (selectedNodeIds: string[]) => {
      if (solidStore.multiSelectionActive) {
        const nodeChanges = selectedNodeIds.map((nodeId: string) => createSelectionChange(nodeId, true));
        store.triggerNodeChanges(nodeChanges);
        return;
      }

      store.triggerNodeChanges(getSelectionChanges(solidStore.nodeLookup, new Set([...selectedNodeIds]), true));
      store.triggerEdgeChanges(getSelectionChanges(solidStore.edgeLookup));
    },
    addSelectedEdges: (selectedEdgeIds: string[]) => {
      if (solidStore.multiSelectionActive) {
        const changedEdges = selectedEdgeIds.map((edgeId: string) => createSelectionChange(edgeId, true));
        store.triggerEdgeChanges(changedEdges);
        return;
      }

      store.triggerEdgeChanges(getSelectionChanges(solidStore.edgeLookup, new Set([...selectedEdgeIds])));
      store.triggerNodeChanges(getSelectionChanges(solidStore.nodeLookup, new Set(), true));
    },
    unselectNodesAndEdges: ({ nodes, edges }: UnselectNodesAndEdgesParams = {}) => {
      const nodesToUnselect = nodes ? nodes : solidStore.nodes;
      const edgesToUnselect = edges ? edges : solidStore.edges;
      const nodeChanges = nodesToUnselect.map((n) => {
        const internalNode = solidStore.nodeLookup.get(n.id);
        if (internalNode) {
          /*
           * we need to unselect the internal node that was selected previously before we
           * send the change to the user to prevent it to be selected while dragging the new node
           */
          internalNode.selected = false;
        }

        return createSelectionChange(n.id, false);
      });
      const edgeChanges = edgesToUnselect.map((edge) => createSelectionChange(edge.id, false));

      store.triggerNodeChanges(nodeChanges);
      store.triggerEdgeChanges(edgeChanges);
    },
    setMinZoom: (minZoom: number) => {
      solidStore.panZoom?.setScaleExtent([minZoom, solidStore.maxZoom]);

      setSolidStore('minZoom', minZoom);
    },
    setMaxZoom: (maxZoom: number) => {
      solidStore.panZoom?.setScaleExtent([solidStore.minZoom, maxZoom]);

      setSolidStore('maxZoom', maxZoom);
    },
    setTranslateExtent: (translateExtent: CoordinateExtent) => {
      solidStore.panZoom?.setTranslateExtent(translateExtent);

      setSolidStore('translateExtent', translateExtent);
    },
    setPaneClickDistance: (clickDistance: number) => {
      solidStore.panZoom?.setClickDistance(clickDistance);
    },
    resetSelectedElements: () => {
      const nodeChanges = solidStore.nodes.reduce<NodeSelectionChange[]>(
        (res, node) => (node.selected ? [...res, createSelectionChange(node.id, false)] : res),
        []
      );
      const edgeChanges = solidStore.edges.reduce<EdgeSelectionChange[]>(
        (res, edge) => (edge.selected ? [...res, createSelectionChange(edge.id, false)] : res),
        []
      );

      store.triggerNodeChanges(nodeChanges);
      store.triggerEdgeChanges(edgeChanges);
    },
    setNodeExtent: (nextNodeExtent: CoordinateExtent) => {
      if (
        nextNodeExtent[0][0] === solidStore.nodeExtent[0][0] &&
        nextNodeExtent[0][1] === solidStore.nodeExtent[0][1] &&
        nextNodeExtent[1][0] === solidStore.nodeExtent[1][0] &&
        nextNodeExtent[1][1] === solidStore.nodeExtent[1][1]
      ) {
        return;
      }

      adoptUserNodes(solidStore.nodes, solidStore.nodeLookup, solidStore.parentLookup, {
        nodeOrigin: solidStore.nodeOrigin,
        nodeExtent: nextNodeExtent,
        elevateNodesOnSelect: solidStore.elevateNodesOnSelect,
        checkEquality: false,
      });

      setSolidStore('nodeExtent', nextNodeExtent);
    },
    panBy: (delta: XYPosition): Promise<boolean> => {
      return panBySystem({
        delta,
        panZoom: solidStore.panZoom,
        transform: solidStore.transform,
        translateExtent: solidStore.translateExtent,
        width: solidStore.width,
        height: solidStore.height,
      });
    },
    fitView: (options?: FitViewOptions): Promise<boolean> => {
      if (!solidStore.panZoom) {
        return Promise.resolve(false);
      }

      const fitViewNodes = getFitViewNodes(solidStore.nodeLookup, options);

      return fitViewSystem(
        {
          nodes: fitViewNodes,
          width: solidStore.width,
          height: solidStore.height,
          panZoom: solidStore.panZoom,
          minZoom: solidStore.minZoom,
          maxZoom: solidStore.maxZoom,
        },
        options
      );
    },
    /*
     * we can't call an asnychronous function in updateNodeInternals
     * for that we created this sync version of fitView
     */
    fitViewSync: (options?: FitViewOptions): boolean => {
      if (!solidStore.panZoom) {
        return false;
      }

      const fitViewNodes = getFitViewNodes(solidStore.nodeLookup, options);

      fitViewSystem(
        {
          nodes: fitViewNodes,
          width: solidStore.width,
          height: solidStore.height,
          panZoom: solidStore.panZoom,
          minZoom: solidStore.minZoom,
          maxZoom: solidStore.maxZoom,
        },
        options
      );

      return fitViewNodes.size > 0;
    },
    cancelConnection: () => {
      setSolidStore('connection', { ...initialConnection });
    },
    updateConnection: (connection: ConnectionState<InternalNode<NodeType>>) => {
      setSolidStore('connection', connection);
    },

    reset: () => setSolidStore({ ...getInitialState() }),
  };
  return store;
}

export { createStore };
