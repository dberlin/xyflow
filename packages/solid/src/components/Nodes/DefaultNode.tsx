import { Position } from '@xyflow/system';

import { Handle } from '../../components/Handle';
import type { BuiltInNode, NodeProps } from '../../types/nodes';

export function DefaultNode(props: NodeProps<BuiltInNode>) {
  return (
    <>
      <Handle type="target" position={props.targetPosition || Position.Top} isConnectable={props.isConnectable} />
      {props.data?.label}
      <Handle type="source" position={props.sourcePosition || Position.Bottom} isConnectable={props.isConnectable} />
    </>
  );
}
