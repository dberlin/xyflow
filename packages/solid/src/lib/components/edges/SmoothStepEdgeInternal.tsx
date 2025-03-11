import { Component, createMemo } from 'solid-js';
import { getSmoothStepPath } from '@xyflow/system';

import BaseEdge from './BaseEdge';
import type { EdgeProps } from '../../types';

export const SmoothStepEdgeInternal: Component<EdgeProps> = (props) => {
  const getPathData = createMemo(() => {
    return getSmoothStepPath({
      sourceX: props.sourceX,
      sourceY: props.sourceY,
      targetX: props.targetX,
      targetY: props.targetY,
      sourcePosition: props.sourcePosition,
      targetPosition: props.targetPosition,
    });
  });

  return (
    <BaseEdge
      path={getPathData()[0]}
      labelX={getPathData()[1]}
      labelY={getPathData()[2]}
      label={props.label}
      labelStyle={props.labelStyle}
      markerStart={props.markerStart}
      markerEnd={props.markerEnd}
      interactionWidth={props.interactionWidth}
      style={props.style}
    />
  );
};
