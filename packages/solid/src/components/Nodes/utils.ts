import { errorMessages } from '@xyflow/system';

import type { SolidFlowActions, SolidFlowStore } from '../../types';

/*
 * this handler is called by
 * 1. the click handler when node is not draggable or selectNodesOnDrag = false
 * or
 * 2. the on drag start handler when node is draggable and selectNodesOnDrag = true
 */
export function handleNodeClick({
  id,
  store,
  unselect = false,
  nodeRef,
}: {
  id: string;
  store: {
    getState: () => SolidFlowStore;
    setState: (state: Partial<SolidFlowStore>) => void;
    getActions: () => SolidFlowActions;
  };
  unselect?: boolean;
  nodeRef?: HTMLDivElement;
}) {
  const { nodeLookup, onError, multiSelectionActive } = store.getState();
  const { addSelectedNodes, unselectNodesAndEdges } = store.getActions();
  const node = nodeLookup.get(id);

  if (!node) {
    onError?.('012', errorMessages['error012'](id));
    return;
  }

  store.setState({ nodesSelectionActive: false });

  if (!node.selected) {
    addSelectedNodes([id]);
  } else if (unselect || (node.selected && multiSelectionActive)) {
    unselectNodesAndEdges({ nodes: [node], edges: [] });

    requestAnimationFrame(() => nodeRef?.blur());
  }
}
