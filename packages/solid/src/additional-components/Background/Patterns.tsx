import { Component } from 'solid-js';
import cc from 'classcat';

import { BackgroundVariant } from './types';

type LinePatternProps = {
  dimensions: [number, number];
  variant: BackgroundVariant;
  lineWidth?: number;
  class?: string;
};

export const LinePattern: Component<LinePatternProps> = (props) => {
  return (
    <path
      stroke-width={props.lineWidth}
      d={`M${props.dimensions[0] / 2} 0 V${props.dimensions[1]} M0 ${props.dimensions[1] / 2} H${props.dimensions[0]}`}
      class={cc(['solid-flow__background-pattern', props.variant, props.class])}
    />
  );
};

type DotPatternProps = {
  radius: number;
  class?: string;
};

export const DotPattern: Component<DotPatternProps> = (props) => {
  return (
    <circle
      cx={props.radius}
      cy={props.radius}
      r={props.radius}
      class={cc(['solid-flow__background-pattern', 'dots', props.class])}
    />
  );
};
