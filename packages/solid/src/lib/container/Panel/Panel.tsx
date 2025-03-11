import { Component, createMemo, splitProps } from 'solid-js';
import type { PanelProps } from './types';
import { useStore } from '../../store';
import cc from 'classcat';

export const Panel: Component<PanelProps> = (props) => {
  const [local, others] = splitProps(props, ['position', 'style', 'class', 'children']);

  const store = useStore();

  const positionClasses = createMemo(() => {
    const position = local.position || 'top-right';
    return `${position}`.split('-');
  });

  const styleAttribute = createMemo(() => {
    const pointerEventsStyle = store.selectionRectMode ? 'pointer-events: none;' : '';
    return local.style ? `${local.style}; ${pointerEventsStyle}` : pointerEventsStyle;
  });

  return (
    <div class={cc(['solid-flow__panel', local.class, ...positionClasses()])} style={styleAttribute()} {...others}>
      {props.children}
    </div>
  );
};
