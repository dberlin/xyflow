import { Component, For, Show } from 'solid-js';
import { getNodeDimensions, nodeHasDimensions } from '@xyflow/system';

import { useStore } from '../../hooks/useStore';
import { MiniMapNode } from './MiniMapNode';
import type { SolidFlowState, Node, InternalNode } from '../../types';
import type { MiniMapNodes as MiniMapNodesProps, GetMiniMapNodeAttribute, MiniMapNodeProps } from './types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const window: any;

const selectorNodeIds = (s: SolidFlowState) => s.nodes.map((node) => node.id);
const getAttrFunction = <NodeType extends Node>(
  func: GetMiniMapNodeAttribute | string
): GetMiniMapNodeAttribute<NodeType> => (func instanceof Function ? func : () => func);

const NodeComponentWrapper = <NodeType extends Node>(props: {
  id: string;
  nodeColorFunc: GetMiniMapNodeAttribute<NodeType>;
  nodeStrokeColorFunc: GetMiniMapNodeAttribute<NodeType>;
  nodeClassFunc: GetMiniMapNodeAttribute<NodeType>;
  nodeBorderRadius: number;
  nodeStrokeWidth?: number;
  NodeComponent: Component<MiniMapNodeProps>;
  onClick: MiniMapNodesProps['onClick'];
  shapeRendering: 'geometricPrecision' | 'crispEdges' | 'auto' | 'optimizeSpeed';
}) => {
  const node = useStore((s) => {
    const node = s.nodeLookup.get(props.id) as InternalNode<NodeType>;
    if (!node) return null;
    const { x, y } = node.internals.positionAbsolute;
    const { width, height } = getNodeDimensions(node);

    return {
      node,
      x,
      y,
      width,
      height,
    };
  });

  return (
    <Show when={node && !node.node.hidden && nodeHasDimensions(node.node)}>
      <props.NodeComponent
        x={node.x}
        y={node.y}
        width={node.width}
        height={node.height}
        style={node.node.style}
        selected={!!node.node.selected}
        class={props.nodeClassFunc(node.node)}
        color={props.nodeColorFunc(node.node)}
        borderRadius={props.nodeBorderRadius}
        strokeColor={props.nodeStrokeColorFunc(node.node)}
        strokeWidth={props.nodeStrokeWidth}
        shapeRendering={props.shapeRendering}
        onClick={props.onClick}
        id={node.node.id}
      />
    </Show>
  );
};

const MiniMapNodes: Component<MiniMapNodesProps> = <NodeType extends Node>(props: MiniMapNodesProps<NodeType>) => {
  const nodeIds = useStore(selectorNodeIds);

  return (
    <>
      <For each={nodeIds}>
        {(nodeId) => {
          // Move reactive variables inside the JSX scope to ensure reactivity
          const nodeColorFunc = getAttrFunction<NodeType>(props.nodeColor);
          const nodeStrokeColorFunc = getAttrFunction<NodeType>(props.nodeStrokeColor);
          const nodeClassFunc = getAttrFunction<NodeType>(props.nodeClass);
          const NodeComponent = props.nodeComponent || MiniMapNode;
          const shapeRendering = typeof window === 'undefined' || !!window.chrome ? 'crispEdges' : 'geometricPrecision';

          return (
            <NodeComponentWrapper<NodeType>
              id={nodeId}
              nodeColorFunc={nodeColorFunc}
              nodeStrokeColorFunc={nodeStrokeColorFunc}
              nodeClassFunc={nodeClassFunc}
              nodeBorderRadius={props.nodeBorderRadius ?? 5}
              nodeStrokeWidth={props.nodeStrokeWidth}
              NodeComponent={NodeComponent}
              onClick={props.onClick}
              shapeRendering={shapeRendering}
            />
          );
        }}
      </For>
    </>
  );
};

export default MiniMapNodes;
