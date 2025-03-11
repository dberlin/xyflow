import { type Component, createMemo } from 'solid-js';
import { getBezierEdgeCenter, Position } from '@xyflow/system';

import { BaseEdge } from './BaseEdge';
import type { SimpleBezierEdgeProps } from '../../types';

export interface GetSimpleBezierPathParams {
  sourceX: number;
  sourceY: number;
  sourcePosition?: Position;
  targetX: number;
  targetY: number;
  targetPosition?: Position;
}

interface GetControlParams {
  pos: Position;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function getControl(params: GetControlParams): [number, number] {
  if (params.pos === Position.Left || params.pos === Position.Right) {
    return [0.5 * (params.x1 + params.x2), params.y1];
  }

  return [params.x1, 0.5 * (params.y1 + params.y2)];
}

/**
 * The `getSimpleBezierPath` util returns everything you need to render a simple
 * bezier edge between two nodes.
 * @public
 */
export function getSimpleBezierPath(
  params: GetSimpleBezierPathParams
): [path: string, labelX: number, labelY: number, offsetX: number, offsetY: number] {
  const sourcePosition = params.sourcePosition || Position.Bottom;
  const targetPosition = params.targetPosition || Position.Top;

  const [sourceControlX, sourceControlY] = getControl({
    pos: sourcePosition,
    x1: params.sourceX,
    y1: params.sourceY,
    x2: params.targetX,
    y2: params.targetY,
  });
  const [targetControlX, targetControlY] = getControl({
    pos: targetPosition,
    x1: params.targetX,
    y1: params.targetY,
    x2: params.sourceX,
    y2: params.sourceY,
  });
  const [labelX, labelY, offsetX, offsetY] = getBezierEdgeCenter({
    sourceX: params.sourceX,
    sourceY: params.sourceY,
    targetX: params.targetX,
    targetY: params.targetY,
    sourceControlX,
    sourceControlY,
    targetControlX,
    targetControlY,
  });

  return [
    `M${params.sourceX},${params.sourceY} C${sourceControlX},${sourceControlY} ${targetControlX},${targetControlY} ${params.targetX},${params.targetY}`,
    labelX,
    labelY,
    offsetX,
    offsetY,
  ];
}

const createSimpleBezierEdge = (params: { isInternal: boolean }) => {
  const EdgeComponent: Component<SimpleBezierEdgeProps> = (props) => {
    const pathParams = createMemo(() => ({
      sourceX: props.sourceX,
      sourceY: props.sourceY,
      sourcePosition: props.sourcePosition || Position.Bottom,
      targetX: props.targetX,
      targetY: props.targetY,
      targetPosition: props.targetPosition || Position.Top,
    }));

    const pathData = createMemo(() => getSimpleBezierPath(pathParams()));

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

  return EdgeComponent;
};

export const SimpleBezierEdge = createSimpleBezierEdge({ isInternal: false });
export const SimpleBezierEdgeInternal = createSimpleBezierEdge({ isInternal: true });
