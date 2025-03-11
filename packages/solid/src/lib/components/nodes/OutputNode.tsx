import { Position } from '@xyflow/system';
import type { NodeProps } from '../../types';
import { Handle } from '../Handle';
import { Component } from 'solid-js';

export const OutputNode: Component<NodeProps> = (props) => {
  return (
    <>
      {props.data?.label || 'Node'}
      <Handle type="target" position={props.targetPosition || Position.Top} />
    </>
  );
};
