import { MarkerType } from '@xyflow/system';
import type { Component } from 'solid-js';

export interface MarkerProps {
  id: string;
  type: MarkerType;
  width?: number;
  height?: number;
  markerUnits?: 'strokeWidth' | 'userSpaceOnUse';
  orient?: string;
  color?: string;
  strokeWidth?: number;
}

export const Marker: Component<MarkerProps> = (props) => {
  return (
    <marker
      class="solid-flow__arrowhead"
      id={props.id}
      markerWidth={`${props.width || 12.5}`}
      markerHeight={`${props.height || 12.5}`}
      viewBox="-10 -10 20 20"
      markerUnits={props.markerUnits || 'strokeWidth'}
      orient={props.orient || 'auto-start-reverse'}
      refX="0"
      refY="0"
    >
      {props.type === MarkerType.Arrow ? (
        <polyline
          stroke={props.color}
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width={props.strokeWidth}
          fill="none"
          points="-5,-4 0,0 -5,4"
        />
      ) : props.type === MarkerType.ArrowClosed ? (
        <polyline
          stroke={props.color}
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width={props.strokeWidth}
          fill={props.color}
          points="-5,-4 0,0 -5,4 -5,-4"
        />
      ) : null}
    </marker>
  );
};
