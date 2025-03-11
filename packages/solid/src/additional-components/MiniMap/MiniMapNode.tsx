import { Component, createMemo } from 'solid-js';
import cc from 'classcat';

import type { MiniMapNodeProps } from './types';

const MiniMapNode: Component<MiniMapNodeProps> = (props) => {
  // Use createMemo to handle reactive props properly
  const getFill = createMemo(() => {
    const background = props.style?.background;
    const backgroundColor = props.style?.['background-color'];
    return (props.color || background || backgroundColor) as string;
  });

  return (
    <rect
      class={cc(['solid-flow__minimap-node', { selected: props.selected }, props.class])}
      x={props.x}
      y={props.y}
      rx={props.borderRadius}
      ry={props.borderRadius}
      width={props.width}
      height={props.height}
      style={{
        fill: getFill(),
        stroke: props.strokeColor,
        'stroke-width': props.strokeWidth?.toString(),
      }}
      shape-rendering={props.shapeRendering}
      onClick={(event) => props.onClick?.(event, props.id)}
    />
  );
};

export { MiniMapNode };
