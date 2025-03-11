import { Component, createMemo } from 'solid-js';
import { getSmoothStepPath } from '@xyflow/system';

import BaseEdge from './BaseEdge';
import type { StepEdgeProps } from '../../types/edges';

export const StepEdge: Component<StepEdgeProps> = (props) => {
  const getPath = createMemo(() =>
    getSmoothStepPath({
      sourceX: props.sourceX,
      sourceY: props.sourceY,
      targetX: props.targetX,
      targetY: props.targetY,
      sourcePosition: props.sourcePosition,
      targetPosition: props.targetPosition,
      borderRadius: 0,
      offset: props.pathOptions?.offset,
    })
  );

  return (
    <BaseEdge
      id={props.id}
      path={getPath()[0]}
      labelX={getPath()[1]}
      labelY={getPath()[2]}
      label={props.label}
      labelStyle={props.labelStyle}
      markerStart={props.markerStart}
      markerEnd={props.markerEnd}
      interactionWidth={props.interactionWidth}
      style={props.style}
    />
  );
};
