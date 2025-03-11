import { createEffect } from 'solid-js';
import type { OnViewportChange } from '@xyflow/system';

import { useStoreApi } from './useStore';

export type UseOnViewportChangeOptions = {
  onStart?: OnViewportChange;
  onChange?: OnViewportChange;
  onEnd?: OnViewportChange;
};

/**
 * The `useOnViewportChange` hook lets you listen for changes to the viewport such
 *as panning and zooming. You can provide a callback for each phase of a viewport
 *change: `onStart`, `onChange`, and `onEnd`.
 *
 * @public
 * @param params.onStart - gets called when the viewport starts changing
 * @param params.onChange - gets called when the viewport changes
 * @param params.onEnd - gets called when the viewport stops changing
 *
 * @example
 * ```jsx
 *import { useOnViewportChange } from '@xyflow/solid';
 *
 *function ViewportChangeLogger() {
 *  useOnViewportChange({
 *    onStart: (viewport) => console.log('start', viewport),
 *    onChange: (viewport) => console.log('change', viewport),
 *    onEnd: (viewport) => console.log('end', viewport),
 *  });
 *
 *  return null;
 *}
 *```
 */
export function useOnViewportChange({ onStart, onChange, onEnd }: UseOnViewportChangeOptions) {
  const store = useStoreApi();

  createEffect(() => {
    store.setState({ onViewportChangeStart: onStart });
  });

  createEffect(() => {
    store.setState({ onViewportChange: onChange });
  });

  createEffect(() => {
    store.setState({ onViewportChangeEnd: onEnd });
  });
}
