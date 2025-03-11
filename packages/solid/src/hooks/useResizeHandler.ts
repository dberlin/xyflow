import { onCleanup, onMount } from 'solid-js';
import { errorMessages, getDimensions } from '@xyflow/system';

import { useStoreApi } from '../hooks/useStore';

/**
 * Hook for handling resize events.
 *
 * @internal
 */
export function useResizeHandler(domNode: { current: HTMLDivElement | null }): void {
  const store = useStoreApi();

  onMount(() => {
    const updateDimensions = () => {
      if (!domNode.current) {
        return false;
      }
      const size = getDimensions(domNode.current);

      if (size.height === 0 || size.width === 0) {
        store.getState().onError?.('004', errorMessages['error004']());
      }

      store.setState({ width: size.width || 500, height: size.height || 500 });
    };

    if (domNode.current) {
      updateDimensions();
      window.addEventListener('resize', updateDimensions);

      const resizeObserver = new ResizeObserver(() => updateDimensions());
      resizeObserver.observe(domNode.current);

      onCleanup(() => {
        window.removeEventListener('resize', updateDimensions);

        if (resizeObserver && domNode.current) {
          resizeObserver.unobserve(domNode.current);
        }
      });
    }
  });
}
