import type { Component, JSX } from 'solid-js';
import type { PanelPosition, XYPosition } from '@xyflow/system';

import type { Node } from '../../types';

export type GetMiniMapNodeAttribute<NodeType extends Node = Node> = (node: NodeType) => string;

/**
 * @expand
 */
export type MiniMapProps<NodeType extends Node = Node> = Omit<JSX.GSVGAttributes<SVGSVGElement>, 'onClick'> & {
  /** Color of nodes on minimap */
  nodeColor?: string | GetMiniMapNodeAttribute<NodeType>;
  /** Stroke color of nodes on minimap */
  nodeStrokeColor?: string | GetMiniMapNodeAttribute<NodeType>;
  /** Class applied to nodes on minimap */
  nodeClass?: string | GetMiniMapNodeAttribute<NodeType>;
  /** Border radius of nodes on minimap */
  nodeBorderRadius?: number;
  /** Stroke width of nodes on minimap */
  nodeStrokeWidth?: number;
  /** Component used to render nodes on minimap */
  nodeComponent?: Component<MiniMapNodeProps>;
  /** Background color of minimap */
  bgColor?: string;
  /** Color of mask representing viewport */
  maskColor?: string;
  /** Stroke color of mask representing viewport */
  maskStrokeColor?: string;
  /** Stroke width of mask representing viewport */
  maskStrokeWidth?: number;
  /**
   * Position of minimap on pane
   * @example PanelPosition.TopLeft, PanelPosition.TopRight,
   * PanelPosition.BottomLeft, PanelPosition.BottomRight
   */
  position?: PanelPosition;
  /** Callback caled when minimap is clicked*/
  onClick?: (event: MouseEvent, position: XYPosition) => void;
  /** Callback called when node on minimap is clicked */
  onNodeClick?: (event: MouseEvent, node: NodeType) => void;
  /** If true, viewport is pannable via mini map component */
  pannable?: boolean;
  /** If true, viewport is zoomable via mini map component */
  zoomable?: boolean;
  /** The aria-label attribute */
  ariaLabel?: string | null;
  /** Invert direction when panning the minimap viewport */
  inversePan?: boolean;
  /** Step size for zooming in/out on minimap */
  zoomStep?: number;
  /** Offset the viewport on the minmap, acts like a padding */
  offsetScale?: number;
  /** Style applied to minimap */
  style?: JSX.CSSProperties;
};

export type MiniMapNodes<NodeType extends Node = Node> = Pick<
  MiniMapProps<NodeType>,
  'nodeColor' | 'nodeStrokeColor' | 'nodeClass' | 'nodeBorderRadius' | 'nodeStrokeWidth' | 'nodeComponent'
> & {
  onClick?: (event: MouseEvent, nodeId: string) => void;
};

/**
 * The props that are passed to the MiniMapNode component
 *
 * @public
 * @expand
 */
export type MiniMapNodeProps = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  borderRadius: number;
  class: string;
  color?: string;
  shapeRendering: 'geometricPrecision' | 'crispEdges' | 'auto' | 'optimizeSpeed';
  strokeColor?: string;
  strokeWidth?: number;
  style?: JSX.CSSProperties;
  selected: boolean;
  onClick?: (event: MouseEvent, id: string) => void;
};
