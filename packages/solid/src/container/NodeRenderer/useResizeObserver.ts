import { SolidFlowState } from '../../types';
import { useStore, useStoreApi } from '../../hooks/useStore';
import { InternalNodeUpdate } from '@xyflow/system';
import { createSignal, onCleanup } from 'solid-js';

export function useResizeObserver() {
  const { updateNodeInternals } = useStoreApi().getActions();
  const [resizeObserver] = createSignal(() => {
    if (typeof ResizeObserver === 'undefined') {
      return null;
    }

    const observer = new ResizeObserver((entries: ResizeObserverEntry[]) => {
      const updates = new Map<string, InternalNodeUpdate>();
      entries.forEach((entry: ResizeObserverEntry) => {
        const id = entry.target.getAttribute('data-id') as string;
        updates.set(id, {
          id,
          nodeElement: entry.target as HTMLDivElement,
          force: true,
        });
      });

      updateNodeInternals(updates);
    });
    onCleanup(() => {
      observer?.disconnect();
    });
    return observer;
  });

  return resizeObserver;
}
