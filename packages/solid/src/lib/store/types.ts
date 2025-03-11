import type {
  Connection,
  CoordinateExtent,
  InternalNodeUpdate,
  UpdateConnection,
  UpdateNodePositions,
  Viewport,
  ViewportHelperFunctionOptions,
  XYPosition,
} from '@xyflow/system';

import type { getInitialStore } from './initial-store';
import type { Edge, EdgeTypes, FitViewOptions, Node, NodeTypes } from '../types';
import type { SolidFlowProps } from '../container/SolidFlow';

export type SolidFlowStoreActions = {
  setNodeTypes: (nodeTypes: NodeTypes) => void;
  setEdgeTypes: (edgeTypes: EdgeTypes) => void;
  addEdge: (edge: Edge | Connection) => void;
  zoomIn: (options?: ViewportHelperFunctionOptions) => Promise<boolean>;
  zoomOut: (options?: ViewportHelperFunctionOptions) => Promise<boolean>;
  setMinZoom: (minZoom: number) => void;
  setMaxZoom: (maxZoom: number) => void;
  setTranslateExtent: (extent: CoordinateExtent) => void;
  setPaneClickDistance: (distance: number) => void;
  fitView: (options?: FitViewOptions) => Promise<boolean>;
  updateNodePositions: UpdateNodePositions;
  updateNodeInternals: (updates: Map<string, InternalNodeUpdate>) => void;
  unselectNodesAndEdges: (params?: { nodes?: Node[]; edges?: Edge[] }) => void;
  addSelectedNodes: (ids: string[]) => void;
  addSelectedEdges: (ids: string[]) => void;
  handleNodeSelection: (id: string) => void;
  handleEdgeSelection: (id: string) => void;
  panBy: (delta: XYPosition) => Promise<boolean>;
  updateConnection: UpdateConnection;
  cancelConnection: () => void;
  reset(): void;
};

export type SolidFlowRestProps = Omit<
  SolidFlowProps,
  | 'width'
  | 'height'
  | 'class'
  | 'proOptions'
  | 'selectionKey'
  | 'deleteKey'
  | 'panActivationKey'
  | 'multiSelectionKey'
  | 'zoomActivationKey'
  | 'paneClickDistance'
  | 'nodeClickDistance'
  | 'onMoveStart'
  | 'onMoveEnd'
  | 'onMove'
  | 'onnodeclick'
  | 'onnodecontextmenu'
  | 'onnodedrag'
  | 'onnodedragstart'
  | 'onnodedragstop'
  | 'onnodepointerenter'
  | 'onnodepointermove'
  | 'onnodepointerleave'
  | 'onselectionclick'
  | 'onselectioncontextmenu'
  | 'onedgeclick'
  | 'onedgecontextmenu'
  | 'onedgepointerenter'
  | 'onedgepointerleave'
  | 'onpaneclick'
  | 'onpanecontextmenu'
  | 'panOnScrollMode'
  | 'preventScrolling'
  | 'zoomOnScroll'
  | 'zoomOnDoubleClick'
  | 'zoomOnPinch'
  | 'panOnScroll'
  | 'panOnDrag'
  | 'selectionOnDrag'
  | 'connectionLineComponent'
  | 'connectionLineStyle'
  | 'connectionLineContainerStyle'
  | 'connectionLineType'
  | 'attributionPosition'
  | 'children'
  | 'nodes'
  | 'edges'
  | 'viewport'
>;

export type StoreSignals = {
  props: SolidFlowRestProps;
  width?: number;
  height?: number;
  nodes: Node[];
  edges: Edge[];
  viewport?: Viewport;
};

export type SolidFlowStoreState = ReturnType<typeof getInitialStore>;

export type SolidFlowStore = SolidFlowStoreState & SolidFlowStoreActions;

export type StoreContext = {
  getStore: () => SolidFlowStore;
  provider: boolean;
};

export type ProviderContext = StoreContext & {
  setStore: (store: SolidFlowStore) => void;
};
