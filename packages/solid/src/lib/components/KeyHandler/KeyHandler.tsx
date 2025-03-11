import { Component, createEffect, onCleanup } from 'solid-js';
import { shortcut, type ShortcutEventDetail, type ShortcutModifierDefinition } from '../../actions/shortcut';
import { isInputDOMNode, isMacOs } from '@xyflow/system';

import type { KeyHandlerProps } from './types';
import type { KeyDefinition, KeyDefinitionObject } from '../../types/general';
import { useSolidFlow } from '../../hooks/useSolidFlow';
import { useStore } from '../../hooks/useStore';

export const KeyHandler: Component<KeyHandlerProps> = (props: KeyHandlerProps) => {
  const solidFlow = useSolidFlow();
  const store = useStore();

  const selectionKey = () => props.selectionKey ?? 'Shift';
  const multiSelectionKey = () => props.multiSelectionKey ?? (isMacOs() ? 'Meta' : 'Control');
  const deleteKey = () => props.deleteKey ?? 'Backspace';
  const panActivationKey = () => props.panActivationKey ?? ' ';
  const zoomActivationKey = () => props.zoomActivationKey ?? (isMacOs() ? 'Meta' : 'Control');

  function isKeyObject(key?: KeyDefinition | null): key is KeyDefinitionObject {
    return key !== null && typeof key === 'object';
  }

  function getModifier(key?: KeyDefinition | null): ShortcutModifierDefinition {
    return isKeyObject(key) ? key.modifier || [] : [];
  }

  function getKeyString(key?: KeyDefinition | null): string {
    if (key === null || key === undefined) {
      // this is a workaround to check if a key is set
      // if not we won't call the callback
      return '';
    }

    return isKeyObject(key) ? key.key : key;
  }

  function getShortcutTrigger(
    key: KeyDefinition | KeyDefinition[] | null | undefined,
    callback: (detail: ShortcutEventDetail) => void
  ) {
    const keys = Array.isArray(key) ? key : [key];
    return keys.map((_key) => {
      const keyString = getKeyString(_key);
      return {
        key: keyString,
        modifier: getModifier(_key),
        enabled: keyString !== null,
        callback,
      };
    });
  }

  function resetKeysAndSelection() {
    store.selectionRect = null;
    store.selectionKeyPressed = false;
    store.multiselectionKeyPressed = false;
    store.deleteKeyPressed = false;
    store.panActivationKeyPressed = false;
    store.zoomActivationKeyPressed = false;
  }

  async function handleDelete() {
    const selectedNodes = store.nodes.filter((node) => node.selected);
    const selectedEdges = store.edges.filter((edge) => edge.selected);

    const { deletedNodes, deletedEdges } = await solidFlow.deleteElements({
      nodes: selectedNodes,
      edges: selectedEdges,
    });

    if (deletedNodes.length > 0 || deletedEdges.length > 0) {
      store.ondelete?.({
        nodes: deletedNodes,
        edges: deletedEdges,
      });
    }
  }

  // Set up window event listeners - this is equivalent to solid:window
  const window: Window = globalThis.window;

  createEffect(() => {
    // Blur event
    window.addEventListener('blur', resetKeysAndSelection);
    // Context menu event
    window.addEventListener('contextmenu', resetKeysAndSelection);

    // Selection key events
    shortcut(window, {
      trigger: getShortcutTrigger(selectionKey(), () => (store.selectionKeyPressed = true)),
      type: 'keydown',
    });

    shortcut(window, {
      trigger: getShortcutTrigger(selectionKey(), () => (store.selectionKeyPressed = false)),
      type: 'keyup',
    });

    // Multi-selection key events
    shortcut(window, {
      trigger: getShortcutTrigger(multiSelectionKey(), () => {
        store.multiselectionKeyPressed = true;
      }),
      type: 'keydown',
    });

    shortcut(window, {
      trigger: getShortcutTrigger(multiSelectionKey(), () => (store.multiselectionKeyPressed = false)),
      type: 'keyup',
    });

    // Delete key events
    shortcut(window, {
      trigger: getShortcutTrigger(deleteKey(), (detail) => {
        const isModifierKey =
          detail.originalEvent.ctrlKey || detail.originalEvent.metaKey || detail.originalEvent.shiftKey;
        if (!isModifierKey && !isInputDOMNode(detail.originalEvent)) {
          store.deleteKeyPressed = true;
          handleDelete();
        }
      }),
      type: 'keydown',
    });

    shortcut(window as unknown as HTMLElement, {
      trigger: getShortcutTrigger(deleteKey(), () => (store.deleteKeyPressed = false)),
      type: 'keyup',
    });

    // Pan activation key events
    shortcut(window as unknown as HTMLElement, {
      trigger: getShortcutTrigger(panActivationKey(), () => (store.panActivationKeyPressed = true)),
      type: 'keydown',
    });

    shortcut(window as unknown as HTMLElement, {
      trigger: getShortcutTrigger(panActivationKey(), () => (store.panActivationKeyPressed = false)),
      type: 'keyup',
    });

    // Zoom activation key events
    shortcut(window as unknown as HTMLElement, {
      trigger: getShortcutTrigger(zoomActivationKey(), () => (store.zoomActivationKeyPressed = true)),
      type: 'keydown',
    });

    shortcut(window as unknown as HTMLElement, {
      trigger: getShortcutTrigger(zoomActivationKey(), () => (store.zoomActivationKeyPressed = false)),
      type: 'keyup',
    });

    // Cleanup function
    onCleanup(() => {
      window.removeEventListener('blur', resetKeysAndSelection);
      window.removeEventListener('contextmenu', resetKeysAndSelection);

      // Note: Solid's cleanup should handle the shortcut actions
    });
  });

  // Return empty fragment since this component doesn't render anything visually
  return <></>;
};
