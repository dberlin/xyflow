import type { SolidFlowStore } from '../../store/types';
import type { InternalNode } from '../../types';

export type ConnectableContext = {
  value: boolean;
};

export type NodeWrapperProps = {
  node: InternalNode;
  store: SolidFlowStore;
  nodeClickDistance?: number;
  resizeObserver?: ResizeObserver | null;
};
