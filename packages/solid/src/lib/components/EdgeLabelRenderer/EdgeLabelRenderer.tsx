import { Component, JSX } from 'solid-js';
import { Portal } from 'solid-js/web';
import { useStore } from '../../store';

interface EdgeLabelRendererProps {
  children?: JSX.Element;
}

export const EdgeLabelRenderer: Component<EdgeLabelRendererProps> = (props) => {
  const store = useStore();

  return (
    <Portal mount={store.domNode?.querySelector('.solid-flow__edgelabel-renderer') || undefined}>
      {props.children}
    </Portal>
  );
};
