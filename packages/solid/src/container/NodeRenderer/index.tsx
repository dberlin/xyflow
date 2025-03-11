import { Component, createMemo, For, JSX, splitProps } from 'solid-js';

import { useVisibleNodeIds } from '../../hooks/useVisibleNodeIds';
import { useStore } from '../../hooks/useStore';
import { containerStyle } from '../../styles/utils';
import { GraphViewProps } from '../GraphView';
import { useResizeObserver } from './useResizeObserver';
import { NodeWrapper } from '../../components/NodeWrapper';
import type { Node, SolidFlowStore } from '../../types';

export type NodeRendererProps<NodeType extends Node> = Pick<
  GraphViewProps<NodeType>,
  | 'onNodeClick'
  | 'onNodeDoubleClick'
  | 'onNodeMouseEnter'
  | 'onNodeMouseMove'
  | 'onNodeMouseLeave'
  | 'onNodeContextMenu'
  | 'onlyRenderVisibleElements'
  | 'noPanClass'
  | 'noDragClass'
  | 'rfId'
  | 'disableKeyboardA11y'
  | 'nodeExtent'
  | 'nodeTypes'
  | 'nodeClickDistance'
>;

const selector = (s: SolidFlowStore) => ({
  nodesDraggable: s.nodesDraggable,
  nodesConnectable: s.nodesConnectable,
  nodesFocusable: s.nodesFocusable,
  elementsSelectable: s.elementsSelectable,
  onError: s.onError,
});

export const NodeRenderer: Component<NodeRendererProps<Node>> = (props) => {
  const [local] = splitProps(props, [
    'onNodeClick',
    'onNodeDoubleClick',
    'onNodeMouseEnter',
    'onNodeMouseMove',
    'onNodeMouseLeave',
    'onNodeContextMenu',
    'onlyRenderVisibleElements',
    'noPanClass',
    'noDragClass',
    'rfId',
    'disableKeyboardA11y',
    'nodeExtent',
    'nodeTypes',
    'nodeClickDistance',
  ]);

  const { nodesDraggable, nodesConnectable, nodesFocusable, elementsSelectable, onError } = useStore(selector);
  const currentlyVisible = createMemo(() => useVisibleNodeIds(local.onlyRenderVisibleElements)());
  // Get the ResizeObserver instance
  const resizeObserverFn = useResizeObserver();
  // Create a memo for the ResizeObserver instance
  const resizeObserver = createMemo(() => {
    const observer = resizeObserverFn();
    return observer ? observer() : null;
  });

  return (
    <div class="solid-flow__nodes" style={containerStyle as JSX.CSSProperties}>
      <For each={currentlyVisible()}>
        {(nodeId) => (
          <NodeWrapper
            id={nodeId}
            nodeTypes={local.nodeTypes}
            nodeExtent={local.nodeExtent}
            onClick={local.onNodeClick}
            onMouseEnter={local.onNodeMouseEnter}
            onMouseMove={local.onNodeMouseMove}
            onMouseLeave={local.onNodeMouseLeave}
            onContextMenu={local.onNodeContextMenu}
            onDoubleClick={local.onNodeDoubleClick}
            noDragClass={local.noDragClass}
            noPanClass={local.noPanClass}
            rfId={local.rfId}
            disableKeyboardA11y={local.disableKeyboardA11y}
            resizeObserver={resizeObserver()}
            nodesDraggable={nodesDraggable}
            nodesConnectable={nodesConnectable}
            nodesFocusable={nodesFocusable}
            elementsSelectable={elementsSelectable}
            nodeClickDistance={local.nodeClickDistance}
            onError={onError}
          />
        )}
      </For>
    </div>
  );
};
