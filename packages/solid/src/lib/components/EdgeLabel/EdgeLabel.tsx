import { EdgeLabelRenderer } from '../EdgeLabelRenderer';
import { useStore } from '../../store';
import type { Component, JSX } from 'solid-js';
import { useContext } from 'solid-js';
import { EdgeIdContext } from '../../types/contexts';
import cc from 'classcat';

type EdgeLabelProps = {
  x?: number;
  y?: number;
  style?: string;
  class?: string;
  children?: JSX.Element;
};

export const EdgeLabel: Component<EdgeLabelProps> = (props) => {
  const store = useStore();
  const id = useContext(EdgeIdContext);

  const handleClick = () => {
    if (id) store.handleEdgeSelection(id);
  };

  return (
    <EdgeLabelRenderer>
      <div
        class={cc(['sold-flow__edge-label', props.class])}
        style={
          `transform: translate(-50%, -50%) translate(${props.x || 0}px,${props.y || 0}px); pointer-events: all;` +
          props.style
        }
        role="button"
        tabindex="-1"
        onKeyUp={() => {}}
        onClick={handleClick}
      >
        {props.children}
      </div>
    </EdgeLabelRenderer>
  );
};
