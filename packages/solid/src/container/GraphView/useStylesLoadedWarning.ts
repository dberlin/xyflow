import { createEffect, createSignal } from 'solid-js';
import { errorMessages } from '@xyflow/system';

import { useStoreApi } from '../../hooks/useStore';

export function useStylesLoadedWarning() {
  const store = useStoreApi();
  const [checked, setChecked] = createSignal(false);

  createEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      if (!checked()) {
        const pane = document.querySelector('.solid-flow__pane');

        if (pane && !(window.getComputedStyle(pane).zIndex === '1')) {
          store.getState().onError?.('013', errorMessages['error013']('solid'));
        }

        setChecked(true);
      }
    }
  });
}
