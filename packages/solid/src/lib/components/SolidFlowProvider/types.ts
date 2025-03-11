import type { NodeOrigin } from '@xyflow/system';
import type { Edge, Node } from '../../types';
import type { JSX } from 'solid-js';

export type SolidFlowProviderProps = {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  initialWidth?: number;
  initialHeight?: number;
  fitView?: boolean;
  nodeOrigin?: NodeOrigin;
  children?: JSX.Element;
};
