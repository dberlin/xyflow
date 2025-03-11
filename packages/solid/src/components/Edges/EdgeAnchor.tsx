import { type Component, type JSX, splitProps } from 'solid-js';
import cc from 'classcat';
import { Position } from '@xyflow/system';

const shiftX = (x: number, shift: number, position: Position): number => {
  if (position === Position.Left) return x - shift;
  if (position === Position.Right) return x + shift;
  return x;
};

const shiftY = (y: number, shift: number, position: Position): number => {
  if (position === Position.Top) return y - shift;
  if (position === Position.Bottom) return y + shift;
  return y;
};

export interface EdgeAnchorProps extends JSX.SvgSVGAttributes<SVGGElement> {
  position: Position;
  centerX: number;
  centerY: number;
  radius?: number;
  onMouseDown: (e: MouseEvent) => void;
  onMouseEnter: (e: MouseEvent) => void;
  onMouseOut: (e: MouseEvent) => void;
  type: string;
}

const EdgeUpdaterClass = 'solid-flow__edgeupdater';

export const EdgeAnchor: Component<EdgeAnchorProps> = (props) => {
  const [local] = splitProps(props, [
    'position',
    'centerX',
    'centerY',
    'radius',
    'type',
    'onMouseDown',
    'onMouseEnter',
    'onMouseOut',
  ]);

  // Create wrapper handlers that simply pass through to the original handlers
  const handleOnMouseDown: JSX.EventHandlerUnion<SVGCircleElement, MouseEvent> = (e) => local.onMouseDown(e);
  const handleOnMouseEnter: JSX.EventHandlerUnion<SVGCircleElement, MouseEvent> = (e) => local.onMouseEnter(e);
  const handleOnMouseOut: JSX.EventHandlerUnion<SVGCircleElement, MouseEvent> = (e) => local.onMouseOut(e);

  return (
    <circle
      onMouseDown={handleOnMouseDown}
      onMouseEnter={handleOnMouseEnter}
      onMouseOut={handleOnMouseOut}
      class={cc([EdgeUpdaterClass, `${EdgeUpdaterClass}-${local.type}`])}
      cx={shiftX(local.centerX, local.radius || 10, local.position)}
      cy={shiftY(local.centerY, local.radius || 10, local.position)}
      r={local.radius || 10}
      stroke="transparent"
      fill="transparent"
    />
  );
};
