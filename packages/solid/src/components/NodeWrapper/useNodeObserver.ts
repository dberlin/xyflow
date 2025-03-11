import { createEffect, createSignal, onCleanup } from 'solid-js';

import type { InternalNode } from '../../types';
import { useStoreApi } from '../../hooks/useStore';
import { Position } from '@xyflow/system';

/**
 * Hook to handle the resize observation + internal updates for the passed node.
 *
 * @internal
 * @returns nodeRef - reference to the node element
 */
export function useNodeObserver(props: {
  node: InternalNode;
  nodeType: string;
  hasDimensions: boolean;
  resizeObserver: ResizeObserver | null;
}) {
  const store = useStoreApi();
  const [nodeRef, setNodeRef] = createSignal<HTMLDivElement | null>(null);
  let observedNode: HTMLDivElement | undefined;
  // Use variables to track previous values since we're only using them for comparison
  // and not for reactive rendering
  let prevSourcePosition: Position;
  let prevTargetPosition: Position;
  let prevType: string;

  // Handle resize observation
  createEffect(() => {
    const isInitialized = props.hasDimensions && !!props.node.internals.handleBounds;

    if (nodeRef() && !props.node.hidden && (!isInitialized || observedNode !== nodeRef())) {
      if (observedNode) {
        props.resizeObserver?.unobserve(observedNode);
      }
      props.resizeObserver?.observe(nodeRef());
      observedNode = nodeRef();
    }
  });

  // Cleanup effect
  onCleanup(() => {
    if (observedNode) {
      props.resizeObserver?.unobserve(observedNode);
      observedNode = undefined;
    }
  });

  // Handle node position and type changes
  createEffect(() => {
    if (nodeRef()) {
      /*
       * when the user programmatically changes the source or handle position, we need to update the internals
       * to make sure the edges are updated correctly
       */
      const typeChanged = prevType !== props.nodeType;
      const sourcePosChanged = prevSourcePosition !== props.node.sourcePosition;
      const targetPosChanged = prevTargetPosition !== props.node.targetPosition;

      if (typeChanged || sourcePosChanged || targetPosChanged) {
        prevType = props.nodeType;
        prevSourcePosition = props.node.sourcePosition;
        prevTargetPosition = props.node.targetPosition;

        store
          .getActions()
          .updateNodeInternals(new Map([[props.node.id, { id: props.node.id, nodeElement: nodeRef(), force: true }]]));
      }
    }
  });

  return [nodeRef, setNodeRef];
}
