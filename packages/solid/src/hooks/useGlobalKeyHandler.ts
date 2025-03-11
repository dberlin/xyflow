import { createEffect } from 'solid-js';
import type { KeyCode } from '@xyflow/system';

import { useStoreApi } from '../hooks/useStore';
import { useKeyPress, UseKeyPressOptions } from './useKeyPress';
import { useSolidFlow } from './useSolidFlow';
import { Edge, Node } from '../types';

const selected = (item: Node | Edge) => item.selected;

const deleteKeyOptions: UseKeyPressOptions = { actInsideInputWithModifier: false };
const win = typeof window !== 'undefined' ? window : undefined;

/**
 * Hook for handling global key events.
 *
 * @internal
 */
export function useGlobalKeyHandler(props: {
  deleteKeyCode: KeyCode | null;
  multiSelectionKeyCode: KeyCode | null;
}): void {
  const store = useStoreApi();
  const { deleteElements } = useSolidFlow();
  createEffect(() => {
    const deleteKeyPressed = useKeyPress(props.deleteKeyCode, deleteKeyOptions);
    const multiSelectionKeyPressed = useKeyPress(props.multiSelectionKeyCode, { target: win });

    if (deleteKeyPressed) {
      const { edges, nodes } = store.getState();
      deleteElements({ nodes: nodes.filter(selected), edges: edges.filter(selected) });
      store.setState({ nodesSelectionActive: false });
    }
    store.setState({ multiSelectionActive: multiSelectionKeyPressed() });
  });
}
