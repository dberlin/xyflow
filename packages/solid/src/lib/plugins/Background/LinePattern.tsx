import { Component } from 'solid-js';
import type { BackgroundVariant } from './types';
import cc from 'classcat';

interface LinePatternProps {
  lineWidth: number;
  dimensions: [number, number];
  variant: BackgroundVariant;
  class?: string;
}

const LinePattern: Component<LinePatternProps> = (props) => {
  return (
    <path
      stroke-width={props.lineWidth}
      d={`M${props.dimensions[0] / 2} 0 V${props.dimensions[1]} M0 ${props.dimensions[1] / 2} H${props.dimensions[0]}`}
      class={cc(['solid-flow__background-pattern', props.variant, props.class])}
    />
  );
};

export default LinePattern;
