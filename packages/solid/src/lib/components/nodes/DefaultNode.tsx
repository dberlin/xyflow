import { Position } from '@xyflow/system';

import { Handle } from '../Handle';
import type { NodeProps } from '../../types';
import { Component } from 'solid-js';

export const DefaultNode: Component<NodeProps> = (props) => {
  return (
    <>
      <Handle type="target" position={props.targetPosition || Position.Top} />
      {props.data?.label || 'Node'}
      <Handle type="source" position={props.sourcePosition || Position.Bottom} />
    </>
  );
};
