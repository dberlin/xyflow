import { type Component, createMemo } from 'solid-js';
import { getBezierPath, Position } from '@xyflow/system';

import { BaseEdge } from './BaseEdge';
import type { BezierEdgeProps } from '../../types';

function createBezierEdge(params: { isInternal: boolean }) {
  const BezierEdgeComponent: Component<BezierEdgeProps> = (props) => {
    const pathParams = createMemo(() => ({
      sourceX: props.sourceX,
      sourceY: props.sourceY,
      sourcePosition: props.sourcePosition || Position.Bottom,
      targetX: props.targetX,
      targetY: props.targetY,
      targetPosition: props.targetPosition || Position.Top,
      curvature: props.pathOptions?.curvature,
    }));

    const pathData = createMemo(() => getBezierPath(pathParams()));

    return (
      <BaseEdge
        id={params.isInternal ? undefined : props.id}
        path={pathData()[0]}
        labelX={pathData()[1]}
        labelY={pathData()[2]}
        label={props.label}
        labelStyle={props.labelStyle}
        labelShowBg={props.labelShowBg}
        labelBgStyle={props.labelBgStyle}
        labelBgPadding={props.labelBgPadding}
        labelBgBorderRadius={props.labelBgBorderRadius}
        style={props.style}
        marker-start={props.markerStart}
        marker-end={props.markerEnd}
        interactionWidth={props.interactionWidth}
      />
    );
  };

  return BezierEdgeComponent;
}

const BezierEdge = createBezierEdge({ isInternal: false });
const BezierEdgeInternal = createBezierEdge({ isInternal: true });

export { BezierEdge, BezierEdgeInternal };
