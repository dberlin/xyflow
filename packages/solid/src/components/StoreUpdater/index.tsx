/*
 * This component helps us to update the store with the values coming from the user.
 * We distinguish between values we can update directly with `useDirectStoreUpdater` (like `snapGrid`)
 * and values that have a dedicated setter function in the store (like `setNodes`).
 */
import { type CoordinateExtent, infiniteExtent } from '@xyflow/system';

import { useStoreApi } from '../../hooks/useStore';
import type { Edge, FitViewOptions, Node, SolidFlowProps } from '../../types';
import { defaultNodeOrigin } from '../../container/SolidFlow/init-values';
import { createEffect, createSignal } from 'solid-js';

// these fields exist in the global store and we need to keep them up to date
const solidFlowFieldsToTrack = [
  'nodes',
  'edges',
  'defaultNodes',
  'defaultEdges',
  'onConnect',
  'onConnectStart',
  'onConnectEnd',
  'onClickConnectStart',
  'onClickConnectEnd',
  'nodesDraggable',
  'nodesConnectable',
  'nodesFocusable',
  'edgesFocusable',
  'edgesReconnectable',
  'elevateNodesOnSelect',
  'elevateEdgesOnSelect',
  'minZoom',
  'maxZoom',
  'nodeExtent',
  'onNodesChange',
  'onEdgesChange',
  'elementsSelectable',
  'connectionMode',
  'snapGrid',
  'snapToGrid',
  'translateExtent',
  'connectOnClick',
  'defaultEdgeOptions',
  'fitView',
  'fitViewOptions',
  'onNodesDelete',
  'onEdgesDelete',
  'onDelete',
  'onNodeDrag',
  'onNodeDragStart',
  'onNodeDragStop',
  'onSelectionDrag',
  'onSelectionDragStart',
  'onSelectionDragStop',
  'onMoveStart',
  'onMove',
  'onMoveEnd',
  'noPanClass',
  'nodeOrigin',
  'autoPanOnConnect',
  'autoPanOnNodeDrag',
  'onError',
  'connectionRadius',
  'isValidConnection',
  'selectNodesOnDrag',
  'nodeDragThreshold',
  'onBeforeDelete',
  'debug',
  'autoPanSpeed',
  'paneClickDistance',
] as const;

type SolidFlowFieldsToTrack = (typeof solidFlowFieldsToTrack)[number];
type StoreUpdaterProps<NodeType extends Node = Node, EdgeType extends Edge = Edge> = Pick<
  SolidFlowProps<NodeType, EdgeType>,
  SolidFlowFieldsToTrack
> & {
  rfId: string;
};

// rfId doesn't exist in SolidFlowProps, but it's one of the fields we want to update
const fieldsToTrack = [...solidFlowFieldsToTrack, 'rfId'] as const;

const initPrevValues = {
  /*
   * these are values that are also passed directly to other components
   * than the StoreUpdater. We can reduce the number of setStore calls
   * by setting the same values here as prev fields.
   */
  translateExtent: infiniteExtent,
  nodeOrigin: defaultNodeOrigin,
  minZoom: 0.5,
  maxZoom: 2,
  elementsSelectable: true,
  noPanClass: 'nopan',
  rfId: '1',
  paneClickDistance: 0,
};

export function StoreUpdater<NodeType extends Node = Node, EdgeType extends Edge = Edge>(
  props: StoreUpdaterProps<NodeType, EdgeType>
) {
  const store = useStoreApi<NodeType, EdgeType>();
  const {
    setDefaultNodesAndEdges,
    reset,
    setNodes,
    setEdges,
    setMinZoom,
    setMaxZoom,
    setTranslateExtent,
    setNodeExtent,
    setPaneClickDistance,
  } = store.getActions();

  createEffect(() => {
    setDefaultNodesAndEdges(props.defaultNodes, props.defaultEdges);

    return () => {
      // when we reset the store we also need to reset the previous fields
      setPreviousFields(initPrevValues);
      reset();
    };
  });

  const [previousFields, setPreviousFields] =
    createSignal<Partial<StoreUpdaterProps<NodeType, EdgeType>>>(initPrevValues);

  createEffect(() => {
    for (const fieldName of fieldsToTrack) {
      const fieldValue = props[fieldName];
      const previousFieldValue = previousFields()[fieldName];

      if (fieldValue === previousFieldValue) continue;
      if (typeof props[fieldName] === 'undefined') continue;
      // Custom handling with dedicated setters for some fields
      if (fieldName === 'nodes') setNodes(fieldValue as NodeType[]);
      else if (fieldName === 'edges') setEdges(fieldValue as EdgeType[]);
      else if (fieldName === 'minZoom') setMinZoom(fieldValue as number);
      else if (fieldName === 'maxZoom') setMaxZoom(fieldValue as number);
      else if (fieldName === 'translateExtent') setTranslateExtent(fieldValue as CoordinateExtent);
      else if (fieldName === 'nodeExtent') setNodeExtent(fieldValue as CoordinateExtent);
      else if (fieldName === 'paneClickDistance') setPaneClickDistance(fieldValue as number);
      // Renamed fields
      else if (fieldName === 'fitView') store.setState({ fitViewOnInit: fieldValue as boolean });
      else if (fieldName === 'fitViewOptions') store.setState({ fitViewOnInitOptions: fieldValue as FitViewOptions });
      // General case
      else store.setState({ [fieldName]: fieldValue });
    }
    setPreviousFields(props);
  });

  return null;
}
