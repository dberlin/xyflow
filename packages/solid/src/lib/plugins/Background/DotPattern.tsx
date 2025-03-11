import { Component } from 'solid-js';
import cc from 'classcat';

interface DotPatternProps {
  radius: number;
  class?: string;
}

const DotPattern: Component<DotPatternProps> = (props) => {
  return (
    <circle
      cx={props.radius}
      cy={props.radius}
      r={props.radius}
      class={cc(['solid-flow__background-pattern', 'dots', props.class])}
    />
  );
};

export default DotPattern;
