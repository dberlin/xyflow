import { Component, createMemo, JSX, useContext } from 'solid-js';
import { Portal } from 'solid-js/web';
import { getNodeToolbarTransform, Position } from '@xyflow/system';

import { useStore } from '../../hooks/useStore';
import { useSolidFlow } from '../../hooks/useSolidFlow';
import { NodeIdContext } from '../../types/contexts';

import type { InternalNode } from '../../types';

export interface NodeToolbarProps {
  nodeId?: string | string[];
  position?: Position;
  align?: 'center' | 'start' | 'end';
  offset?: number;
  isVisible?: boolean;
  children?: JSX.Element;
}

export const NodeToolbar: Component<NodeToolbarProps> = (props) => {
  const store = useStore();
  const { getNodesBounds } = useSolidFlow();
  const contextNodeId = useContext(NodeIdContext);

  const toolbarNodes = createMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    store.nodes;
    const nodeIds = Array.isArray(props.nodeId) ? props.nodeId : [props.nodeId ?? contextNodeId];

    return nodeIds.reduce<InternalNode[]>((res, nodeId) => {
      const node = store.nodeLookup.get(nodeId);

      if (node) {
        res.push(node);
      }

      return res;
    }, []);
  });

  // Explicitly track the store.nodes dependency
  const nodesUpdated = createMemo(() => store.nodes);

  const transform = createMemo(() => {
    // Access nodesUpdated to ensure this depends on store.nodes
    nodesUpdated();
    const nodeRect = getNodesBounds(toolbarNodes());
    if (nodeRect) {
      return getNodeToolbarTransform(
        nodeRect,
        store.viewport,
        props.position || Position.Top,
        props.offset || 10,
        props.align || 'center'
      );
    }
    return '';
  });

  const zIndex = createMemo(() => {
    // Access nodesUpdated to ensure this depends on store.nodes
    nodesUpdated();
    const nodes = toolbarNodes();
    return nodes.length === 0 ? 1 : Math.max(...nodes.map((node) => (node.internals.z || 5) + 1));
  });

  const selectedNodesCount = createMemo(() => store.nodes.filter((node) => node.selected).length);

  // if isVisible is not set, we show the toolbar only if its node is selected and no other node is selected
  const isActive = createMemo(() => {
    // Access nodesUpdated to ensure this depends on store.nodes
    nodesUpdated();
    const nodes = toolbarNodes();
    return typeof props.isVisible === 'boolean'
      ? props.isVisible
      : nodes.length === 1 && nodes[0].selected && selectedNodesCount() === 1;
  });

  return (
    <>
      {store.domNode && isActive() && toolbarNodes().length > 0 && (
        <Portal mount={store.domNode}>
          <div
            data-id={toolbarNodes()
              .reduce((acc, node) => `${acc}${node.id} `, '')
              .trim()}
            class="solid-flow__node-toolbar"
            style={{
              position: 'absolute',
              transform: transform(),
              'z-index': zIndex(),
            }}
          >
            {props.children}
          </div>
        </Portal>
      )}
    </>
  );
};
