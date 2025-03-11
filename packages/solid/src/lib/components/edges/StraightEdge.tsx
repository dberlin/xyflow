import { Component, createMemo } from 'solid-js';
import { getStraightPath } from '@xyflow/system';

import BaseEdge from './BaseEdge';
import type { StraightEdgeProps } from '../../types';

export const StraightEdge: Component<StraightEdgeProps> = (props) => {
  // Calculate path and label position using createMemo for reactivity
  const pathData = createMemo(() => {
    return getStraightPath({
      sourceX: props.sourceX,
      sourceY: props.sourceY,
      targetX: props.targetX,
      targetY: props.targetY,
    });
  });

  return (
    <BaseEdge
      id={props.id}
      path={pathData()[0]}
      labelX={pathData()[1]}
      labelY={pathData()[2]}
      label={props.label}
      labelStyle={props.labelStyle}
      markerStart={props.markerStart}
      markerEnd={props.markerEnd}
      interactionWidth={props.interactionWidth}
      style={props.style}
      class={props.class}
    />
  );
};
