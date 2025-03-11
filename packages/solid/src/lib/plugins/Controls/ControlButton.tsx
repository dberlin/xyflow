import { Component, JSX } from 'solid-js';
import { filterUndefinedStyles } from '../../utils';
import cc from 'classcat';

export interface ControlButtonProps {
  class?: string;
  bgColor?: string;
  bgColorHover?: string;
  color?: string;
  colorHover?: string;
  borderColor?: string;
  onclick?: (event: MouseEvent) => void;
  children?: JSX.Element;
  [key: string]: unknown;
}
export const ControlButton: Component<ControlButtonProps> = (props) => {
  return (
    <button
      {...props}
      type="button"
      onClick={(e) => props.onclick?.(e)}
      class={cc(['solid-flow__controls-button', props.class])}
      style={filterUndefinedStyles([
        ['--xy-controls-button-background-color-props', props.bgColor],
        ['--xy-controls-button-background-color-hover-props', props.bgColorHover],
        ['--xy-controls-button-color-props', props.color],
        ['--xy-controls-button-color-hover-props', props.colorHover],
        ['--xy-controls-button-border-color-props', props.borderColor],
      ])}
    >
      {props.children}
    </button>
  );
};
