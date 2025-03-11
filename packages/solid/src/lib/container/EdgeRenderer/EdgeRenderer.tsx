import { Component, For, onMount } from 'solid-js';
import { EdgeWrapper } from '../../components/EdgeWrapper';
import { MarkerDefinition } from '../../container/EdgeRenderer/MarkerDefinition';
import type { EdgeEvents } from '../../types';
import type { SolidFlowStore } from '../../store/types';

interface EdgeRendererProps extends EdgeEvents {
  store: SolidFlowStore;
  onedgeclick?: EdgeEvents['onedgeclick'];
  onedgecontextmenu?: EdgeEvents['onedgecontextmenu'];
  onedgepointerenter?: EdgeEvents['onedgepointerenter'];
  onedgepointerleave?: EdgeEvents['onedgepointerleave'];
}

export const EdgeRenderer: Component<EdgeRendererProps> = (props: EdgeRendererProps) => {
  onMount(() => {
    if (!props.store.edgesInitialized && props.store.visible.edges.size > 0) {
      props.store.edgesInitialized = true;
    }
  });

  // Note: The onDestroy handler from Svelte was commented out in the original code
  // onCleanup(() => {
  //   props.store.edgesInitialized = false;
  // });

  return (
    <div class="solid-flow__edges">
      <svg class="solid-flow__marker">
        <MarkerDefinition />
      </svg>

      <For each={Array.from(props.store.visible.edges.values())}>
        {(edge) => (
          <EdgeWrapper
            store={props.store}
            edge={edge}
            onedgeclick={props.onedgeclick}
            onedgecontextmenu={props.onedgecontextmenu}
            onedgepointerenter={props.onedgepointerenter}
            onedgepointerleave={props.onedgepointerleave}
          />
        )}
      </For>
    </div>
  );
};
