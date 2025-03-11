import { createEffect, createMemo, createSignal, onCleanup } from 'solid-js';
import { createStore } from 'solid-js/store';
import { isInputDOMNode, type KeyCode } from '@xyflow/system';

type Keys = Array<string>;
type PressedKeys = Set<string>;
type KeyOrCode = 'key' | 'code';

export type UseKeyPressOptions = {
  target?: Window | Document | HTMLElement | ShadowRoot | null;
  actInsideInputWithModifier?: boolean;
};

const defaultDoc = typeof document !== 'undefined' ? document : null;

/**
 * This hook lets you listen for specific key codes and tells you whether they are
 * currently pressed or not.
 *
 * @public
 * @param param.keyCode - The key code (string or array of strings) to use
 * @param param.options - Options
 * @returns boolean
 *
 * @example
 * ```tsx
 *import { useKeyPress } from '@xyflow/solid';
 *
 *export default function () {
 *  const spacePressed = useKeyPress('Space');
 *  const cmdAndSPressed = useKeyPress(['Meta+s', 'Strg+s']);
 *
 *  return (
 *    <div>
 *     {spacePressed() && <p>Space pressed!</p>}
 *     {cmdAndSPressed() && <p>Cmd + S pressed!</p>}
 *    </div>
 *  );
 *}
 *```
 */
export function useKeyPress(
  /*
   * the keycode can be a string 'a' or an array of strings ['a', 'a+d']
   * a string means a single key 'a' or a combination when '+' is used 'a+d'
   * an array means different possibilites. Explainer: ['a', 'd+s'] here the
   * user can use the single key 'a' or the combination 'd' + 's'
   */
  keyCode: KeyCode | null = null,
  options: UseKeyPressOptions = { target: defaultDoc, actInsideInputWithModifier: true }
): () => boolean {
  const [keyPressed, setKeyPressed] = createSignal(false);

  // we need to remember if a modifier key is pressed in order to track it
  const [state, setState] = createStore({
    modifierPressed: false,
    pressedKeys: new Set([]) as PressedKeys,
  });

  /*
   * keyCodes = array with single keys [['a']] or key combinations [['a', 's']]
   * keysToWatch = array with all keys flattened ['a', 'd', 'ShiftLeft']
   * used to check if we store event.code or event.key. When the code is in the list of keysToWatch
   * we use the code otherwise the key. Explainer: When you press the left "command" key, the code is "MetaLeft"
   * and the key is "Meta". We want users to be able to pass keys and codes so we assume that the key is meant when
   * we can't find it in the list of keysToWatch.
   */
  const keyCodeData = createMemo<[Array<Keys>, Keys]>(() => {
    if (keyCode !== null) {
      const keyCodeArr = Array.isArray(keyCode) ? keyCode : [keyCode];
      const keys = keyCodeArr
        .filter((kc) => typeof kc === 'string')
        /*
         * we first replace all '+' with '\n'  which we will use to split the keys on
         * then we replace '\n\n' with '\n+', this way we can also support the combination 'key++'
         * in the end we simply split on '\n' to get the key array
         */
        .map((kc) => kc.replace('+', '\n').replace('\n\n', '\n+').split('\n'));
      const keysFlat = keys.reduce((res: Keys, item) => res.concat(...item), []);

      return [keys, keysFlat];
    }

    return [[], []];
  });

  /* This was a useEffect, and it did set state before. We should make sure it will not infinite loop in solid */
  createEffect(() => {
    const target = options?.target || defaultDoc;

    if (keyCode !== null) {
      const downHandler = (event: KeyboardEvent) => {
        const isModifierPressed = event.ctrlKey || event.metaKey || event.shiftKey;
        setState('modifierPressed', isModifierPressed);

        const preventAction =
          (!state.modifierPressed || (state.modifierPressed && !options.actInsideInputWithModifier)) &&
          isInputDOMNode(event);

        if (preventAction) {
          return false;
        }

        const [keyCodes, keysToWatch] = keyCodeData();
        const keyOrCode = useKeyOrCode(event.code, keysToWatch);

        // Create a new Set with the current keys plus the new one
        const updatedKeys = new Set(state.pressedKeys);
        updatedKeys.add(event[keyOrCode]);
        setState('pressedKeys', updatedKeys);

        if (isMatchingKey(keyCodes, updatedKeys, false)) {
          event.preventDefault();
          setKeyPressed(true);
        }
      };

      const upHandler = (event: KeyboardEvent) => {
        const preventAction =
          (!state.modifierPressed || (state.modifierPressed && !options.actInsideInputWithModifier)) &&
          isInputDOMNode(event);

        if (preventAction) {
          return false;
        }

        const [keyCodes, keysToWatch] = keyCodeData();
        const keyOrCode = useKeyOrCode(event.code, keysToWatch);

        if (isMatchingKey(keyCodes, state.pressedKeys, true)) {
          setKeyPressed(false);
          setState('pressedKeys', new Set([]));
        } else {
          // Create a new Set without the released key
          const updatedKeys = new Set(state.pressedKeys);
          updatedKeys.delete(event[keyOrCode]);
          setState('pressedKeys', updatedKeys);
        }

        // fix for Mac: when cmd key is pressed, keyup is not triggered for any other key, see: https://stackoverflow.com/questions/27380018/when-cmd-key-is-kept-pressed-keyup-is-not-triggered-for-any-other-key
        if (event.key === 'Meta') {
          setState('pressedKeys', new Set([]));
        }

        setState('modifierPressed', false);
      };

      const resetHandler = () => {
        setState('pressedKeys', new Set([]));
        setKeyPressed(false);
      };

      target?.addEventListener('keydown', downHandler as EventListenerOrEventListenerObject);
      target?.addEventListener('keyup', upHandler as EventListenerOrEventListenerObject);
      window.addEventListener('blur', resetHandler);
      window.addEventListener('contextmenu', resetHandler);

      onCleanup(() => {
        target?.removeEventListener('keydown', downHandler as EventListenerOrEventListenerObject);
        target?.removeEventListener('keyup', upHandler as EventListenerOrEventListenerObject);
        window.removeEventListener('blur', resetHandler);
        window.removeEventListener('contextmenu', resetHandler);
      });
    }
  });

  return keyPressed;
}

// utils

function isMatchingKey(keyCodes: Array<Keys>, pressedKeys: PressedKeys, isUp: boolean): boolean {
  return (
    keyCodes
      /*
       * we only want to compare same sizes of keyCode definitions
       * and pressed keys. When the user specified 'Meta' as a key somewhere
       * this would also be truthy without this filter when user presses 'Meta' + 'r'
       */
      .filter((keys) => isUp || keys.length === pressedKeys.size)
      /*
       * since we want to support multiple possibilities only one of the
       * combinations need to be part of the pressed keys
       */
      .some((keys) => keys.every((k) => pressedKeys.has(k)))
  );
}

function useKeyOrCode(eventCode: string, keysToWatch: KeyCode): KeyOrCode {
  return keysToWatch.includes(eventCode) ? 'code' : 'key';
}
