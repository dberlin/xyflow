import { getBezierPath } from '@xyflow/system';
import { Component, createMemo } from 'solid-js';

import BaseEdge from './BaseEdge';
import type { BezierEdgeProps } from '../../types/edges';

export const BezierEdge: Component<BezierEdgeProps> = (props) => {
  const pathCalculation = createMemo(() =>
    getBezierPath({
      sourceX: props.sourceX,
      sourceY: props.sourceY,
      targetX: props.targetX,
      targetY: props.targetY,
      sourcePosition: props.sourcePosition,
      targetPosition: props.targetPosition,
      curvature: props.pathOptions?.curvature,
    })
  );

  return (
    <BaseEdge
      id={props.id}
      path={pathCalculation()[0]}
      labelX={pathCalculation()[1]}
      labelY={pathCalculation()[2]}
      label={props.label}
      labelStyle={props.labelStyle}
      markerStart={props.markerStart}
      markerEnd={props.markerEnd}
      interactionWidth={props.interactionWidth}
      style={props.style}
    />
  );
};
