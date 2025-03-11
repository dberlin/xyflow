import { Component, mergeProps, Show } from 'solid-js';
import './Selection.css';

interface SelectionProps {
  x?: number | null;
  y?: number | null;
  width?: number | string | null;
  height?: number | string | null;
  isVisible?: boolean;
}

export const Selection: Component<SelectionProps> = (props) => {
  const merged = mergeProps({ x: 0, y: 0, width: 0, height: 0, isVisible: true }, props);

  return (
    <Show when={merged.isVisible}>
      <div
        class="solid-flow__selection"
        style={{
          width: typeof merged.width === 'string' ? merged.width : `${merged.width}px`,
          height: typeof merged.height === 'string' ? merged.height : `${merged.height}px`,
          transform: `translate(${merged.x}px, ${merged.y}px)`,
        }}
      />
    </Show>
  );
};

export default Selection;
