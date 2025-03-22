import { type OnDrag, XYDrag } from '@xyflow/system';

import type { SolidFlowStore } from '../../store/types';
import { createEffect, onCleanup } from 'solid-js';

export type UseDragParams = {
  store: SolidFlowStore;
  disabled?: boolean;
  noDragClass?: string;
  handleSelector?: string;
  nodeId?: string;
  isSelectable?: boolean;
  nodeClickDistance?: number;
  onDrag?: OnDrag;
  onDragStart?: OnDrag;
  onDragStop?: OnDrag;
  onNodeMouseDown?: (id: string) => void;
};

declare module 'solid-js' {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace JSX {
    interface Directives {
      drag: UseDragParams;
    }
  }
}

export default function drag(domNode: Element, params: UseDragParams) {
  const { store, onDrag, onDragStart, onDragStop, onNodeMouseDown } = params;
  const dragInstance = XYDrag({
    onDrag,
    onDragStart,
    onDragStop,
    onNodeMouseDown,
    getStoreItems: () => {

      return {
        nodes: store.nodes,
        nodeLookup: store.nodeLookup,
        edges: store.edges,
        nodeExtent: store.nodeExtent,
        snapGrid: store.snapGrid ? store.snapGrid : [0, 0],
        snapToGrid: !!store.snapGrid,
        nodeOrigin: store.nodeOrigin,
        multiSelectionActive: store.multiselectionKeyPressed,
        domNode: store.domNode,
        transform: [store.viewport.x, store.viewport.y, store.viewport.zoom],
        autoPanOnNodeDrag: store.autoPanOnNodeDrag,
        nodesDraggable: store.nodesDraggable,
        selectNodesOnDrag: store.selectNodesOnDrag,
        nodeDragThreshold: store.nodeDragThreshold,
        unselectNodesAndEdges: store.unselectNodesAndEdges,
        updateNodePositions: store.updateNodePositions,
        panBy: store.panBy,
      };
    },
  });

  function updateDrag(domNode: Element, params: UseDragParams) {
    if (params.disabled) {
      dragInstance.destroy();
      return;
    }

    dragInstance.update({
      domNode,
      noDragClassName: params.noDragClass,
      handleSelector: params.handleSelector,
      nodeId: params.nodeId,
      isSelectable: params.isSelectable,
      nodeClickDistance: params.nodeClickDistance,
    });
  }

  // Used to use an update ruin, which don't exist in solid
  createEffect(() => updateDrag(domNode, params));
  onCleanup(() => dragInstance.destroy());
}
