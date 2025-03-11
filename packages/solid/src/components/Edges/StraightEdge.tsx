import { type Component, createMemo } from 'solid-js';
import { getStraightPath } from '@xyflow/system';

import { BaseEdge } from './BaseEdge';
import type { StraightEdgeProps } from '../../types';

function createStraightEdge(params: { isInternal: boolean }) {
  const StraightEdgeComponent: Component<StraightEdgeProps> = (props) => {
    const pathParams = createMemo(() => ({
      sourceX: props.sourceX,
      sourceY: props.sourceY,
      targetX: props.targetX,
      targetY: props.targetY,
    }));

    const pathData = createMemo(() => getStraightPath(pathParams()));

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
        marker-end={props.markerEnd}
        marker-start={props.markerStart}
        interactionWidth={props.interactionWidth}
      />
    );
  };

  return StraightEdgeComponent;
}

const StraightEdge = createStraightEdge({ isInternal: false });
const StraightEdgeInternal = createStraightEdge({ isInternal: true });

export { StraightEdge, StraightEdgeInternal };
