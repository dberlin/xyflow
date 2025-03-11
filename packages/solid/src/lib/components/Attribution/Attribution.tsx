import { Component, Show } from 'solid-js';
import { Panel } from '../../container/Panel';
import type { AttributionProps } from './types';

export const Attribution: Component<AttributionProps> = (props: AttributionProps) => {
  return (
    <Show when={!props.proOptions?.hideAttribution}>
      <Panel
        position={props.position || 'bottom-right'}
        class="solid-flow__attribution"
        data-message="Feel free to remove the attribution or check out how you could support us: https://solidflow.dev/support-us"
      >
        <a href="https://solidflow.dev" target="_blank" rel="noopener noreferrer" aria-label="Svelte Flow attribution">
          Solid Flow
        </a>
      </Panel>
    </Show>
  );
};
