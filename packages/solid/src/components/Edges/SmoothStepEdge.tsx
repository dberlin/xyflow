import { type Component, createMemo } from 'solid-js';
import { getSmoothStepPath, Position } from '@xyflow/system';

import { BaseEdge } from './BaseEdge';
import type { SmoothStepEdgeProps } from '../../types';

function createSmoothStepEdge(params: { isInternal: boolean }) {
  const SmoothStepEdgeComponent: Component<SmoothStepEdgeProps> = (props) => {
    const pathParams = createMemo(() => ({
      sourceX: props.sourceX,
      sourceY: props.sourceY,
      sourcePosition: props.sourcePosition || Position.Bottom,
      targetX: props.targetX,
      targetY: props.targetY,
      targetPosition: props.targetPosition || Position.Top,
      borderRadius: props.pathOptions?.borderRadius,
      offset: props.pathOptions?.offset,
    }));

    const pathData = createMemo(() => getSmoothStepPath(pathParams()));

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

  return SmoothStepEdgeComponent;
}

const SmoothStepEdge = createSmoothStepEdge({ isInternal: false });
const SmoothStepEdgeInternal = createSmoothStepEdge({ isInternal: true });

export { SmoothStepEdge, SmoothStepEdgeInternal };
