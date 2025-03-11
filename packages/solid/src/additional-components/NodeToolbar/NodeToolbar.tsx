import { children, Component, createMemo, JSX, Show } from 'solid-js';
import cc from 'classcat';
import { Position, getNodeToolbarTransform, getInternalNodesBounds, NodeLookup } from '@xyflow/system';

import { InternalNode, SolidFlowStore } from '../../types';
import { useStore } from '../../hooks/useStore';
import { useNodeId } from '../../contexts/NodeIdContext';
import { NodeToolbarPortal } from './NodeToolbarPortal';
import type { NodeToolbarProps } from './types';

const nodeEqualityFn = (a?: InternalNode, b?: InternalNode) =>
  a?.internals.positionAbsolute.x !== b?.internals.positionAbsolute.x ||
  a?.internals.positionAbsolute.y !== b?.internals.positionAbsolute.y ||
  a?.measured.width !== b?.measured.width ||
  a?.measured.height !== b?.measured.height ||
  a?.selected !== b?.selected ||
  a?.internals.z !== b?.internals.z;

const nodesEqualityFn = (a: NodeLookup, b: NodeLookup) => {
  if (a.size !== b.size) {
    return false;
  }

  for (const [key, node] of a) {
    if (nodeEqualityFn(node, b.get(key))) {
      return false;
    }
  }

  return true;
};

const storeSelector = (state: SolidFlowStore) => ({
  x: state.transform[0],
  y: state.transform[1],
  zoom: state.transform[2],
  selectedNodesCount: state.nodes.filter((node) => node.selected).length,
});

/**
 * This component can render a toolbar or tooltip to one side of a custom node. This
 * toolbar doesn't scale with the viewport so that the content is always visible.
 *
 * @public
 * @example
 * ```jsx
 *import { NodeToolbar, Position } from '@xyflow/solid';
 *
 *function CustomNode(props) {
 *  return (
 *    <>
 *      <NodeToolbar isVisible={props.data.toolbarVisible} position={props.data.toolbarPosition}>
 *        <button>delete</button>
 *        <button>copy</button>
 *        <button>expand</button>
 *      </NodeToolbar>
 *
 *      <div style={{ padding: '10px 20px' }}>
 *        {props.data.label}
 *      </div>
 *
 *      <Handle type="target" position={Position.Left} />
 *      <Handle type="source" position={Position.Right} />
 *    </>
 *  );
 *};
 *
 *export default CustomNode;
 *```
 * @remarks By default, the toolbar is only visible when a node is selected. If multiple
 * nodes are selected it will not be visible to prevent overlapping toolbars or
 * clutter. You can override this behavior by setting the `isVisible` prop to `true`.
 */
export const NodeToolbar: Component<NodeToolbarProps> = (props) => {
  const contextNodeId = useNodeId();
  const store = useStore(storeSelector);

  const nodes: Map<string, InternalNode> = useStore<NodeLookup>(
    (state: SolidFlowStore) => {
      const nodeIds = Array.isArray(props.nodeId) ? props.nodeId : [props.nodeId || contextNodeId || ''];
      return nodeIds.reduce<NodeLookup>((res, id) => {
        const node = state.nodeLookup.get(id);
        if (node) {
          res.set(node.id, node);
        }
        return res;
      }, new Map<string, InternalNode>());
    } /* FIXME: Figure this out , nodesEqualityFn*/
  );

  // if isVisible is not set, we show the toolbar only if its node is selected and no other node is selected
  const isActive = createMemo(() =>
    typeof props.isVisible === 'boolean'
      ? props.isVisible
      : nodes.size === 1 && nodes.values().next().value?.selected && store.selectedNodesCount === 1
  );

  const wrapperStyle = createMemo(() => {
    if (!isActive() || !nodes.size) {
      return null;
    }

    const nodeRect = getInternalNodesBounds(nodes);
    const nodesArray = Array.from(nodes.values());
    const zIndex = Math.max(...nodesArray.map((node: InternalNode) => node.internals.z + 1));

    const style: JSX.CSSProperties = {
      position: 'absolute',
      transform: getNodeToolbarTransform(
        nodeRect,
        { x: store.x, y: store.y, zoom: store.zoom },
        props.position || Position.Top,
        props.offset || 10,
        props.align || 'center'
      ),
      'z-index': zIndex,
    };

    if (props.style) {
      Object.assign(style, props.style);
    }

    return style;
  });

  const resolved = children(() => props.children);
  return (
    <Show when={isActive() && nodes.size}>
      <NodeToolbarPortal>
        <div
          style={wrapperStyle()}
          class={cc(['solid-flow__node-toolbar', props.class])}
          data-id={Array.from(nodes.values())
            .reduce((acc, node: InternalNode) => `${acc}${node.id} `, '')
            .trim()}
        >
          {resolved()}
        </div>
      </NodeToolbarPortal>
    </Show>
  );
};
