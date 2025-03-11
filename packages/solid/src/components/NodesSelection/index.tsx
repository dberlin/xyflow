/**
 * The nodes selection rectangle gets displayed when a user
 * made a selection with on or several nodes
 */
import { createEffect, createMemo, createSignal, Show, splitProps } from 'solid-js';
import cc from 'classcat';
import { getInternalNodesBounds, isNumeric } from '@xyflow/system';

import { useStore, useStoreApi } from '../../hooks/useStore';
import { useDrag } from '../../hooks/useDrag';
import { useMoveSelectedNodes } from '../../hooks/useMoveSelectedNodes';
import { arrowKeyDiffs } from '../NodeWrapper/utils';
import type { Node, SolidFlowStore } from '../../types';

export type NodesSelectionProps<NodeType extends Node> = {
  onSelectionContextMenu?: (event: MouseEvent, nodes: NodeType[]) => void;
  noPanClass?: string;
  disableKeyboardA11y: boolean;
};

const selector = (s: SolidFlowStore) => {
  const { width, height, x, y } = getInternalNodesBounds(s.nodeLookup, {
    filter: (node) => !!node.selected,
  });

  return {
    width: isNumeric(width) ? width : null,
    height: isNumeric(height) ? height : null,
    userSelectionActive: s.userSelectionActive,
    transformString: `translate(${s.transform[0]}px,${s.transform[1]}px) scale(${s.transform[2]}) translate(${x}px,${y}px)`,
  };
};

export function NodesSelection<NodeType extends Node>(props: NodesSelectionProps<NodeType>) {
  const [local] = splitProps(props, ['onSelectionContextMenu', 'noPanClass', 'disableKeyboardA11y']);
  const storeApi = useStoreApi<NodeType>();
  const storeData = useStore(selector);
  const moveSelectedNodes = useMoveSelectedNodes();

  const [nodeRef, setNodeRef] = createSignal<HTMLDivElement | undefined>(undefined);

  createEffect(() => {
    if (!local.disableKeyboardA11y && nodeRef()) {
      nodeRef()?.focus({
        preventScroll: true,
      });
    }
  });

  // Create a ref object compatible with the useDrag hook
  const dragNodeRef = {
    get current() {
      return nodeRef();
    },
  };

  useDrag({
    nodeRef: dragNodeRef,
  });

  const onContextMenu = (event: MouseEvent) => {
    if (local.onSelectionContextMenu) {
      const selectedNodes = storeApi.getState().nodes.filter((n) => n.selected);
      local.onSelectionContextMenu(event, selectedNodes);
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (Object.prototype.hasOwnProperty.call(arrowKeyDiffs, event.key)) {
      event.preventDefault();

      moveSelectedNodes({
        direction: arrowKeyDiffs[event.key],
        factor: event.shiftKey ? 4 : 1,
      });
    }
  };

  // Create memoized accessors for reactive properties
  const width = storeData.width;
  const height = storeData.height;
  const transform = storeData.transformString;

  // Create a memoized value to check if we should show the selection
  const shouldShow = createMemo(() => !storeData.userSelectionActive && width !== null && height !== null);
  const handleKeyDown = (e: KeyboardEvent) => {
    if (local.disableKeyboardA11y) return;
    onKeyDown(e);
  };
  return (
    <Show when={shouldShow()}>
      <div
        class={cc(['solid-flow__nodesselection', 'solid-flow__container', local.noPanClass])}
        style={{
          transform: transform,
        }}
      >
        <div
          ref={setNodeRef}
          class="solid-flow__nodesselection-rect"
          onContextMenu={onContextMenu}
          tabIndex={local.disableKeyboardA11y ? undefined : -1}
          onKeyDown={handleKeyDown}
          style={{
            width: `${width}`,
            height: `${height}`,
          }}
        />
      </div>
    </Show>
  );
}
