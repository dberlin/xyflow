import { type Component } from 'solid-js';
import { Position } from '@xyflow/system';

import { Handle } from '../../components/Handle';
import type { BuiltInNode, NodeProps } from '../../types/nodes';

export const OutputNode: Component<NodeProps<BuiltInNode>> = (props) => {
  const targetPosition = () => props.targetPosition || Position.Top;

  return (
    <>
      <Handle type="target" position={targetPosition()} isConnectable={props.isConnectable} />
      {props.data?.label}
    </>
  );
};
