import { Component, createMemo } from 'solid-js';
import { getStraightPath } from '@xyflow/system';

import BaseEdge from './BaseEdge';
import type { EdgeProps } from '../../types/edges';

type StraightEdgeInternalProps = EdgeProps;

export const StraightEdgeInternal: Component<StraightEdgeInternalProps> = (props) => {
  const pathAndLabel = createMemo(() =>
    getStraightPath({
      sourceX: props.sourceX,
      sourceY: props.sourceY,
      targetX: props.targetX,
      targetY: props.targetY,
    })
  );

  return (
    <BaseEdge
      path={pathAndLabel()[0]}
      labelX={pathAndLabel()[1]}
      labelY={pathAndLabel()[2]}
      label={props.label}
      labelStyle={props.labelStyle}
      markerStart={props.markerStart}
      markerEnd={props.markerEnd}
      interactionWidth={props.interactionWidth}
      style={props.style}
    />
  );
};
