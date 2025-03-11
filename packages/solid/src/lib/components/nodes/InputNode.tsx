import { Position } from '@xyflow/system';
import type { NodeProps } from '../../types';
import { Handle } from '../Handle';
import { Component } from 'solid-js';

export const InputNode: Component<NodeProps> = (props) => {
  // In SolidJS we cannot destructure props, so we use them directly
  return (
    <>
      {props.data?.label || 'Node'}
      <Handle type="source" position={props.sourcePosition || Position.Bottom} />
    </>
  );
};
