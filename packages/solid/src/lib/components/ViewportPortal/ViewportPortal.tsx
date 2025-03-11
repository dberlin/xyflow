import { Portal } from 'solid-js/web';
import { Component, JSX } from 'solid-js';
import { useStore } from '../../hooks/useStore';

interface ViewportPortalProps {
  children?: JSX.Element;
}

export const ViewportPortal: Component<ViewportPortalProps> = (props) => {
  const store = useStore();
  return (
    <Portal mount={store.domNode?.querySelector('.solid-flow__viewport-portal') || undefined}>{props.children}</Portal>
  );
};
