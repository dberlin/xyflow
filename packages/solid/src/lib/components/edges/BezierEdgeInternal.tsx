import { Component, createMemo } from 'solid-js';
import { getBezierPath } from '@xyflow/system';

import BaseEdge from './BaseEdge';
import type { EdgeProps } from '../../types/edges';

export const BezierEdgeInternal: Component<EdgeProps> = (props) => {
  const getBezierParams = createMemo(() => {
    return getBezierPath({
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
      path={getBezierParams()[0]}
      labelX={getBezierParams()[1]}
      labelY={getBezierParams()[2]}
      label={props.label}
      labelStyle={props.labelStyle}
      markerStart={props.markerStart}
      markerEnd={props.markerEnd}
      interactionWidth={props.interactionWidth}
      style={props.style}
    />
  );
};
