import cc from 'classcat';
import {
  elementSelectionKeys,
  errorMessages,
  getNodeDimensions,
  isInputDOMNode,
  nodeHasDimensions,
} from '@xyflow/system';

import { useStore, useStoreApi } from '../../hooks/useStore';
import { Provider } from '../../contexts/NodeIdContext';
import { ARIA_NODE_DESC_KEY } from '../A11yDescriptions';
import { useDrag } from '../../hooks/useDrag';
import { useMoveSelectedNodes } from '../../hooks/useMoveSelectedNodes';
import { handleNodeClick } from '../Nodes/utils';
import { arrowKeyDiffs, builtinNodeTypes, getNodeInlineStyleDimensions } from './utils';
import { useNodeObserver } from './useNodeObserver';
import type { InternalNode, Node, NodeWrapperProps } from '../../types';
import { createMemo } from 'solid-js';
import { Dynamic } from 'solid-js/web';

export function NodeWrapper<NodeType extends Node>(props: NodeWrapperProps<NodeType>) {
  const { node, internals, isParent } = useStore((s) => {
    const node = s.nodeLookup.get(props.id)! as InternalNode<NodeType>;
    const isParent = s.parentLookup.has(props.id);

    return {
      node,
      internals: node.internals,
      isParent,
    };
  });

  let nodeType = node.type || 'default';

  const NodeComponent = createMemo(() => {
    let component = props.nodeTypes?.[nodeType] || builtinNodeTypes[nodeType];

    if (component === undefined) {
      props.onError?.('003', errorMessages['error003'](nodeType));
      nodeType = 'default';
      component = builtinNodeTypes.default;
    }
    return component;
  });

  const isDraggable = createMemo(
    () => !!(node.draggable || (props.nodesDraggable && typeof node.draggable === 'undefined'))
  );
  const isSelectable = createMemo(
    () => !!(node.selectable || (props.elementsSelectable && typeof node.selectable === 'undefined'))
  );
  const isConnectable = createMemo(
    () => !!(node.connectable || (props.nodesConnectable && typeof node.connectable === 'undefined'))
  );
  const isFocusable = createMemo(
    () => !!(node.focusable || (props.nodesFocusable && typeof node.focusable === 'undefined'))
  );

  const store = useStoreApi();
  const hasDimensions = createMemo(() => nodeHasDimensions(node));
  const [getNodeRef, setNodeRef] = useNodeObserver({
    node,
    nodeType,
    get hasDimensions() {
      return hasDimensions();
    },
    get resizeObserver() {
      return props.resizeObserver;
    },
  });

  const dragging = createMemo(() =>
    useDrag({
      nodeRef: { current: getNodeRef() },
      disabled: node.hidden || !isDraggable,
      noDragClass: props.noDragClass,
      handleSelector: node.dragHandle,
      nodeId: props.id,
      isSelectable: isSelectable(),
      nodeClickDistance: props.nodeClickDistance,
    })
  );
  const moveSelectedNodes = useMoveSelectedNodes();

  if (node.hidden) {
    return null;
  }

  const nodeDimensions = getNodeDimensions(node);
  const inlineDimensions = getNodeInlineStyleDimensions(node);

  const hasPointerEvents = createMemo(
    () =>
      isSelectable() || isDraggable() || props.onClick || props.onMouseEnter || props.onMouseMove || props.onMouseLeave
  );

  const onSelectNodeHandler = (event: MouseEvent) => {
    const { selectNodesOnDrag, nodeDragThreshold } = store.getState();

    if (isSelectable && (!selectNodesOnDrag || !isDraggable || nodeDragThreshold > 0)) {
      /*
       * this handler gets called by XYDrag on drag start when selectNodesOnDrag=true
       * here we only need to call it when selectNodesOnDrag=false
       */
      handleNodeClick({
        id: props.id,
        store,
        nodeRef: getNodeRef(),
      });
    }

    if (props.onClick) {
      props.onClick(event, { ...internals.userNode });
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (isInputDOMNode(event) || props.disableKeyboardA11y) {
      return;
    }

    if (elementSelectionKeys.includes(event.key) && isSelectable) {
      const unselect = event.key === 'Escape';

      handleNodeClick({
        id: props.id,
        store,
        unselect,
        nodeRef: getNodeRef(),
      });
    } else if (isDraggable && node.selected && Object.prototype.hasOwnProperty.call(arrowKeyDiffs, event.key)) {
      // prevent default scrolling behavior on arrow key press when node is moved
      event.preventDefault();

      store.setState({
        ariaLiveMessage: `Moved selected node ${event.key
          .replace('Arrow', '')
          .toLowerCase()}. New position, x: ${~~internals.positionAbsolute.x}, y: ${~~internals.positionAbsolute.y}`,
      });

      moveSelectedNodes({
        direction: arrowKeyDiffs[event.key],
        factor: event.shiftKey ? 4 : 1,
      });
    }
  };

  return (
    <div
      class={cc([
        'solid-flow__node',
        `solid-flow__node-${nodeType}`,
        {
          // this is overwritable by passing `nopan` as a class name
          [props.noPanClass]: isDraggable,
        },
        node.class,
        {
          selected: node.selected,
          selectable: isSelectable,
          parent: isParent,
          draggable: isDraggable,
          dragging,
        },
      ])}
      ref={setNodeRef}
      style={{
        'z-index': internals.z,
        transform: `translate(${internals.positionAbsolute.x}px,${internals.positionAbsolute.y}px)`,
        'pointer-events': hasPointerEvents ? 'all' : 'none',
        visibility: hasDimensions ? 'visible' : 'hidden',
        // ...node.style,
        ...inlineDimensions,
      }}
      data-id={props.id}
      data-testid={`rf__node-${props.id}`}
      onMouseEnter={(e) => (props.onMouseEnter ? props.onMouseEnter(e, { ...internals.userNode }) : undefined)}
      onMouseMove={(e) => (props.onMouseMove ? props.onMouseMove(e, { ...internals.userNode }) : undefined)}
      onMouseLeave={(e) => (props.onMouseLeave ? props.onMouseLeave(e, { ...internals.userNode }) : undefined)}
      onContextMenu={(e) => (props.onContextMenu ? props.onContextMenu(e, { ...internals.userNode }) : undefined)}
      onClick={onSelectNodeHandler}
      onDblClick={(e) => (props.onDoubleClick ? props.onDoubleClick(e, { ...internals.userNode }) : undefined)}
      onKeyDown={isFocusable ? onKeyDown : undefined}
      tabIndex={isFocusable ? 0 : undefined}
      role={isFocusable ? 'button' : undefined}
      aria-describedby={props.disableKeyboardA11y ? undefined : `${ARIA_NODE_DESC_KEY}-${props.rfId}`}
      aria-label={node.ariaLabel}
    >
      <Provider value={props.id}>
        <Dynamic
          component={NodeComponent()}
          id={props.id}
          data={node.data}
          type={nodeType}
          positionAbsoluteX={internals.positionAbsolute.x}
          positionAbsoluteY={internals.positionAbsolute.y}
          selected={node.selected ?? false}
          selectable={isSelectable()}
          draggable={isDraggable()}
          deletable={node.deletable ?? true}
          isConnectable={isConnectable()}
          sourcePosition={node.sourcePosition}
          targetPosition={node.targetPosition}
          dragging={dragging()()}
          dragHandle={node.dragHandle}
          zIndex={internals.z}
          parentId={node.parentId}
          {...nodeDimensions}
        />
      </Provider>
    </div>
  );
}
