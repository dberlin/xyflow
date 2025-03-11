import { children, Component, JSX } from 'solid-js';
import { Portal } from 'solid-js/web';
import { Show } from 'solid-js';

import type { SolidFlowStore } from '../../types';
import { useStore } from '../../hooks/useStore';

const selector = (state: SolidFlowStore) => state.domNode?.querySelector('.solid-flow__renderer');

type NodeToolbarPortalProps = {
  children: JSX.Element;
};

export const NodeToolbarPortal: Component<NodeToolbarPortalProps> = (props) => {
  const wrapperRef = useStore(selector);
  const resolved = children(() => props.children);

  return (
    <Show when={wrapperRef}>
      <Portal mount={wrapperRef}>{resolved()}</Portal>
    </Show>
  );
};
