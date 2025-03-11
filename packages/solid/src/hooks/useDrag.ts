import { type Accessor, createEffect, createSignal, onCleanup, onMount } from 'solid-js';
import { XYDrag, type XYDragInstance } from '@xyflow/system';

import { handleNodeClick } from '../components/Nodes/utils';
import { useStoreApi } from './useStore';

type UseDragParams = {
  nodeRef: { current: HTMLDivElement | null };
  disabled?: boolean;
  noDragClass?: string;
  handleSelector?: string;
  nodeId?: string;
  isSelectable?: boolean;
  nodeClickDistance?: number;
};

/**
 * Hook for calling XYDrag helper from @xyflow/system.
 *
 * @internal
 */
export function useDrag(params: UseDragParams): Accessor<boolean> {
  const store = useStoreApi();
  const [dragging, setDragging] = createSignal<boolean>(false);
  let xyDragInstance: XYDragInstance | undefined;

  onMount(() => {
    xyDragInstance = XYDrag({
      getStoreItems: () => {
        return {
          ...store.getActions(),
          nodes: store.getState().nodes,
          nodeLookup: store.getState().nodeLookup,
          edges: store.getState().edges,
          nodeExtent: store.getState().nodeExtent,
          snapGrid: store.getState().snapGrid,
          snapToGrid: store.getState().snapToGrid,
          nodeOrigin: store.getState().nodeOrigin,
          multiSelectionActive: store.getState().multiSelectionActive,
          transform: store.getState().transform,
          autoPanOnNodeDrag: store.getState().autoPanOnNodeDrag,
          nodesDraggable: store.getState().nodesDraggable,
          selectNodesOnDrag: store.getState().selectNodesOnDrag,
          nodeDragThreshold: store.getState().nodeDragThreshold,
        };
      },
      onNodeMouseDown: (id: string) => {
        handleNodeClick({
          id,
          store,
          nodeRef: params.nodeRef.current,
        });
      },
      onDragStart: () => {
        setDragging(true);
      },
      onDragStop: () => {
        setDragging(false);
      },
    });
  });

  createEffect(() => {
    if (params.disabled) {
      xyDragInstance?.destroy();
    } else if (params.nodeRef.current) {
      xyDragInstance?.update({
        noDragClassName: params.noDragClass,
        handleSelector: params.handleSelector,
        domNode: params.nodeRef.current,
        isSelectable: params.isSelectable,
        nodeId: params.nodeId,
        nodeClickDistance: params.nodeClickDistance,
      });
    }
  });

  // Clean up the drag instance when the component is unmounted
  onCleanup(() => {
    xyDragInstance?.destroy();
  });

  return dragging;
}
