import type { SolidFlowStore } from '../../store/types';
import type { NodeEvents, NodeSelectionEvents } from '../../types';

export type NodeSelectionProps = { store: SolidFlowStore } & NodeSelectionEvents &
  Pick<NodeEvents, 'onnodedrag' | 'onnodedragstart' | 'onnodedragstop'>;
