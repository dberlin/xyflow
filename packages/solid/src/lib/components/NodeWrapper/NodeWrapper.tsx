import { createEffect, createMemo, mergeProps, onCleanup } from 'solid-js';
import { errorMessages, nodeHasDimensions, Position } from '@xyflow/system';

import drag from '../../actions/drag';
import { getNodeInlineStyleDimensions } from './utils';
import { DefaultNode } from '../nodes/DefaultNode';

import type { ConnectableContext as ConnectableContext, NodeWrapperProps } from './types';
import type { NodeEvents } from '../../types';
import { NodeConnectableContext, NodeIdContext } from '../../types/contexts';
import cc from 'classcat';

export const NodeWrapper = (props: NodeWrapperProps & NodeEvents) => {
  const mergedProps = mergeProps(
    {
      nodeTypes: { default: DefaultNode },
      nodesConnectable: false,
      elementsSelectable: false,
      nodesDraggable: false,
      selectNodesOnDrag: false,
      nodeDragThreshold: 0,
      node: {
        type: 'default',
        connectable: false,
        draggable: false,
        selectable: false,
        selected: false,
        dragging: false,
        deletable: true,
        hidden: false,
        style: '',
        class: '',
        data: {},
        measured: { width: 0, height: 0 },
        internals: {
          z: 0,
          positionAbsolute: { x: 0, y: 0 },
        },
      },
    },
    props
  );

  let nodeRef: HTMLDivElement | null = null;
  let prevNodeRef: HTMLDivElement | null = null;
  let prevType: string | undefined;
  let prevSourcePosition: Position | undefined;
  let prevTargetPosition: Position | undefined;

  const connectableContext: ConnectableContext = {
    get value() {
      return mergedProps.node.connectable || mergedProps.store.nodesConnectable;
    },
  };

  const isParent = () => mergedProps.store.parentLookup.has(mergedProps.node.id);

  const getNodeComponent = () => mergedProps.store.nodeTypes[mergedProps.node.type] ?? DefaultNode;

  const initialized = createMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    // mergedProps.store.nodes;
    const initState = nodeHasDimensions(mergedProps.node) && !!mergedProps.node.internals?.handleBounds;
    console.log('initState', initState);
    return initState;
  });

  const inlineStyleDimensions = createMemo(() => {
    return getNodeInlineStyleDimensions({
      width: mergedProps.node.width,
      height: mergedProps.node.height,
      initialWidth: mergedProps.node.initialWidth,
      initialHeight: mergedProps.node.initialHeight,
      measuredWidth: mergedProps.node.measured.width,
      measuredHeight: mergedProps.node.measured.height,
    });
  });

  if (process.env.NODE_ENV === 'development') {
    createEffect(() => {
      const valid = !!mergedProps.store.nodeTypes[mergedProps.node.type];
      if (!valid) {
        console.warn('003', errorMessages['error003'](mergedProps.node.type));
      }
    });
  }

  createEffect(() => {
    // if type, sourcePosition or targetPosition changes,
    // we need to re-calculate the handle positions
    const doUpdate =
      (prevType && mergedProps.node.type !== prevType) ||
      (prevSourcePosition && mergedProps.node.sourcePosition !== prevSourcePosition) ||
      (prevTargetPosition && mergedProps.node.targetPosition !== prevTargetPosition);

    if (doUpdate && nodeRef !== null) {
      requestAnimationFrame(() => {
        if (nodeRef !== null) {
          mergedProps.store.updateNodeInternals(
            new Map([
              [
                mergedProps.node.id,
                {
                  id: mergedProps.node.id,
                  nodeElement: nodeRef,
                  force: true,
                },
              ],
            ])
          );
        }
      });
    }

    prevType = mergedProps.node.type;
    prevSourcePosition = mergedProps.node.sourcePosition;
    prevTargetPosition = mergedProps.node.targetPosition;
  });

  createEffect(() => {
    if (mergedProps.resizeObserver && (!initialized() || nodeRef !== prevNodeRef)) {
      if (prevNodeRef) mergedProps.resizeObserver.unobserve(prevNodeRef);
      if (nodeRef) mergedProps.resizeObserver.observe(nodeRef);
      prevNodeRef = nodeRef;
    }
  });

  onCleanup(() => {
    if (prevNodeRef) {
      mergedProps.resizeObserver?.unobserve(prevNodeRef);
    }
  });

  const onSelectNodeHandler = (event: MouseEvent | TouchEvent) => {
    if (
      (mergedProps.node.selectable || mergedProps.store.elementsSelectable) &&
      (!mergedProps.store.selectNodesOnDrag ||
        !(mergedProps.node.draggable || mergedProps.store.nodesDraggable) ||
        mergedProps.store.nodeDragThreshold > 0)
    ) {
      // this handler gets called by XYDrag on drag start when selectNodesOnDrag=true
      // here we only need to call it when selectNodesOnDrag=false
      mergedProps.store.handleNodeSelection(mergedProps.node.id);
    }

    mergedProps.onnodeclick?.({ node: mergedProps.node, event });
  };

  return (
    <NodeConnectableContext.Provider value={connectableContext}>
      {/* eslint-disable-next-line solid/reactivity */}
      <NodeIdContext.Provider value={mergedProps.node.id}>
        {!mergedProps.node.hidden && (
          <div
            ref={(el) => {
              nodeRef = el;

              // Initialize drag directive
              if (el) {
                drag(el, {
                  nodeId: mergedProps.node.id,
                  isSelectable: mergedProps.node.selectable || mergedProps.store.elementsSelectable,
                  disabled: !(mergedProps.node.draggable || mergedProps.store.nodesDraggable),
                  handleSelector: mergedProps.node.dragHandle,
                  noDragClass: 'nodrag',
                  nodeClickDistance: mergedProps.nodeClickDistance,
                  onNodeMouseDown: mergedProps.store.handleNodeSelection,
                  onDrag: (event, _, targetNode, nodes) => {
                    mergedProps.onnodedrag?.({ event, targetNode, nodes });
                  },
                  onDragStart: (event, _, targetNode, nodes) => {
                    mergedProps.onnodedragstart?.({ event, targetNode, nodes });
                  },
                  onDragStop: (event, _, targetNode, nodes) => {
                    mergedProps.onnodedragstop?.({ event, targetNode, nodes });
                  },
                  store: mergedProps.store,
                });
              }
            }}
            data-id={mergedProps.node.id}
            class={cc(['solid-flow__node', `solid-flow__node-${mergedProps.node.type}`, mergedProps.node.class])}
            classList={{
              dragging: mergedProps.node.dragging,
              selected: mergedProps.node.selected,
              draggable: mergedProps.node.draggable || mergedProps.store.nodesDraggable,
              connectable: mergedProps.node.connectable || mergedProps.store.nodesConnectable,
              selectable: mergedProps.node.selectable || mergedProps.store.elementsSelectable,
              nopan: mergedProps.node.draggable || mergedProps.store.nodesDraggable,
              parent: isParent(),
            }}
            style={
              `z-index: ${mergedProps.node.internals.z};` +
              `transform: translate(${mergedProps.node.internals.positionAbsolute.x}px, ${mergedProps.node.internals.positionAbsolute.y}px);` +
              `visibility: ${initialized() ? 'visible' : 'hidden'};` +
              mergedProps.node.style +
              ';' +
              `width: ${inlineStyleDimensions().width};` +
              `height: ${inlineStyleDimensions().height};`
            }
            onClick={onSelectNodeHandler}
            onPointerEnter={
              mergedProps.onnodepointerenter
                ? (event) => mergedProps.onnodepointerenter!({ node: mergedProps.node, event })
                : undefined
            }
            onPointerLeave={
              mergedProps.onnodepointerleave
                ? (event) => mergedProps.onnodepointerleave!({ node: mergedProps.node, event })
                : undefined
            }
            onPointerMove={
              mergedProps.onnodepointermove
                ? (event) => mergedProps.onnodepointermove!({ node: mergedProps.node, event })
                : undefined
            }
            onContextMenu={
              mergedProps.onnodecontextmenu
                ? (event) => mergedProps.onnodecontextmenu!({ node: mergedProps.node, event })
                : undefined
            }
          >
            {(() => {
              const NodeComponent = getNodeComponent();
              return (
                <NodeComponent
                  data={mergedProps.node.data}
                  id={mergedProps.node.id}
                  selected={mergedProps.node.selected}
                  selectable={mergedProps.node.selectable || mergedProps.store.elementsSelectable}
                  deletable={mergedProps.node.deletable}
                  sourcePosition={mergedProps.node.sourcePosition}
                  targetPosition={mergedProps.node.targetPosition}
                  zIndex={mergedProps.node.internals.z}
                  dragging={mergedProps.node.dragging}
                  draggable={mergedProps.node.draggable || mergedProps.store.nodesDraggable}
                  dragHandle={mergedProps.node.dragHandle}
                  parentId={mergedProps.node.parentId}
                  type={mergedProps.node.type}
                  isConnectable={mergedProps.node.connectable || mergedProps.store.nodesConnectable}
                  positionAbsoluteX={mergedProps.node.internals.positionAbsolute.x}
                  positionAbsoluteY={mergedProps.node.internals.positionAbsolute.y}
                  width={mergedProps.node.width}
                  height={mergedProps.node.height}
                />
              );
            })()}
          </div>
        )}
      </NodeIdContext.Provider>
    </NodeConnectableContext.Provider>
  );
};

export default NodeWrapper;
