import type { PanelPosition, ProOptions } from '@xyflow/system';
import { type Component, Show } from 'solid-js';

import { Panel } from '../Panel';

type AttributionProps = {
  proOptions?: ProOptions;
  position?: PanelPosition;
};

export const Attribution: Component<AttributionProps> = (props) => {
  const position = () => props.position || 'bottom-right';

  return (
    <Show when={!props.proOptions?.hideAttribution}>
      <Panel
        position={position()}
        class="solid-flow__attribution"
        data-message="Please only hide this attribution when you are subscribed to Solid Flow Pro: https://pro.solidflow.dev"
      >
        <a href="https://solidflow.dev" target="_blank" rel="noopener noreferrer" aria-label="Solid Flow attribution">
          Solid Flow
        </a>
      </Panel>
    </Show>
  );
};
