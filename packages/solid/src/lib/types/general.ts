import type {
  Connection,
  FitViewOptionsBase,
  Handle,
  HandleProps as HandlePropsSystem,
  OnBeforeDeleteBase,
  XYPosition,
} from '@xyflow/system';

import type { Node } from './nodes';
import type { Edge } from './edges';
import { JSX } from 'solid-js';
import { ShortcutModifierDefinition } from '../actions/shortcut';

export type KeyModifier = ShortcutModifierDefinition;
export type KeyDefinitionObject = { key: string; modifier?: KeyModifier };
export type KeyDefinition = string | KeyDefinitionObject;

export type ConnectionData = {
  connectionPosition: XYPosition | null;
  connectionStartHandle: Handle | null;
  connectionEndHandle: Handle | null;
  connectionStatus: string | null;
};

export type HandleProps = HandlePropsSystem & {
  class?: string;
  style?: string;
  onconnect?: (connections: Connection[]) => void;
  ondisconnect?: (connections: Connection[]) => void;
  children?: JSX.Element;
};

export type FitViewOptions<NodeType extends Node = Node> = FitViewOptionsBase<NodeType>;

export type OnDelete = (params: { nodes: Node[]; edges: Edge[] }) => void;
export type OnEdgeCreate = (connection: Connection) => Edge | Connection | void;
export type OnBeforeDelete<NodeType extends Node = Node, EdgeType extends Edge = Edge> = OnBeforeDeleteBase<
  NodeType,
  EdgeType
>;

export type IsValidConnection<EdgeType extends Edge = Edge> = (edge: EdgeType | Connection) => boolean;
