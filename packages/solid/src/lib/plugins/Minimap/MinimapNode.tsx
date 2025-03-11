import { Component } from 'solid-js';
import cc from 'classcat';

type ShapeRendering = 'auto' | 'optimizeSpeed' | 'crispEdges' | 'geometricPrecision' | 'inherit';

type MinimapNodeProps = {
  x: number;
  y: number;
  width: number;
  height: number;
  selected?: boolean;
  color?: string;
  borderRadius: number;
  strokeColor: string;
  strokeWidth: number;
  shapeRendering: ShapeRendering;
  class?: string;
};

export const MinimapNode: Component<MinimapNodeProps> = (props) => {
  return (
    <rect
      class={cc(['solid-flow__minimap-node', props.selected ? 'selected' : '', props.class])}
      x={props.x}
      y={props.y}
      rx={props.borderRadius}
      ry={props.borderRadius}
      width={props.width}
      height={props.height}
      fill={props.color}
      stroke={props.strokeColor}
      stroke-width={props.strokeWidth}
      shape-rendering={props.shapeRendering}
    />
  );
};

export default MinimapNode;
