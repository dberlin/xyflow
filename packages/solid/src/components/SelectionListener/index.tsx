/*
 * This is a helper component for calling the onSelectionChange listener.
 * It will only be mounted if the user has passed an onSelectionChange listener
 * or is using the useOnSelectionChange hook.
 * @TODO: Now that we have the onNodesChange and on EdgesChange listeners, do we still need this component?
 */
import { createEffect, createMemo } from 'solid-js';

import { useStore, useStoreApi } from '../../hooks/useStore';
import type { Edge, Node, OnSelectionChangeFunc, SolidFlowStore } from '../../types';

type SelectionListenerProps<NodeType extends Node = Node, EdgeType extends Edge = Edge> = {
  onSelectionChange?: OnSelectionChangeFunc<NodeType, EdgeType>;
};

const selector = (s: SolidFlowStore) => {
  const selectedNodes = [];
  const selectedEdges = [];

  for (const [, node] of s.nodeLookup) {
    if (node.selected) {
      selectedNodes.push(node.internals.userNode);
    }
  }

  for (const [, edge] of s.edgeLookup) {
    if (edge.selected) {
      selectedEdges.push(edge);
    }
  }

  return { selectedNodes, selectedEdges };
};

type SelectorSlice = ReturnType<typeof selector>;

const selectId = (obj: Node | Edge) => obj.id;
/*
function areEqual(a: SelectorSlice, b: SelectorSlice) {
  return (
    shallow(a.selectedNodes.map(selectId), b.selectedNodes.map(selectId)) &&
    shallow(a.selectedEdges.map(selectId), b.selectedEdges.map(selectId))
  );
}*/

function SelectionListenerInner<NodeType extends Node = Node, EdgeType extends Edge = Edge>(
  props: SelectionListenerProps<NodeType, EdgeType>
) {
  const store = useStoreApi<NodeType, EdgeType>();
  const { selectedNodes, selectedEdges } = useStore(selector /* FIXME: Check this , areEqual*/);

  createEffect(() => {
    const params = { nodes: selectedNodes as NodeType[], edges: selectedEdges as EdgeType[] };

    props.onSelectionChange?.(params);
    for (const fn of store.getState().onSelectionChangeHandlers) {
      fn(params);
    }
  });

  return null;
}

const changeSelector = (s: SolidFlowStore) => !!s.onSelectionChangeHandlers;

export function SelectionListener<NodeType extends Node = Node, EdgeType extends Edge = Edge>(
  props: SelectionListenerProps<NodeType, EdgeType>
) {
  const storeHasSelectionChangeHandlers = useStore(changeSelector);

  const shouldRender = createMemo(() => {
    return !!props.onSelectionChange || storeHasSelectionChangeHandlers;
  });

  return (
    <>{shouldRender() && <SelectionListenerInner<NodeType, EdgeType> onSelectionChange={props.onSelectionChange} />}</>
  );
}
