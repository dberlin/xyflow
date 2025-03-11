import { type Component } from 'solid-js';
import { Position } from '@xyflow/system';

import { Handle } from '../../components/Handle';
import type { BuiltInNode, NodeProps } from '../../types/nodes';

export const InputNode: Component<NodeProps<BuiltInNode>> = (props) => {
  const sourcePosition = () => props.sourcePosition || Position.Bottom;

  return (
    <>
      {props.data?.label}
      <Handle type="source" position={sourcePosition()} isConnectable={props.isConnectable} />
    </>
  );
};
