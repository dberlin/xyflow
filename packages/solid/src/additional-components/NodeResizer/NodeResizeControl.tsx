import { children, Component, createEffect, onCleanup } from 'solid-js';
import { createSignal, createMemo } from 'solid-js';
import cc from 'classcat';
import {
  XYResizer,
  ResizeControlVariant,
  type XYResizerInstance,
  type XYResizerChange,
  type XYResizerChildChange,
  type NodeChange,
  type NodeDimensionChange,
  type NodePositionChange,
  handleExpandParent,
  evaluateAbsolutePosition,
  ParentExpandChild,
  XYPosition,
} from '@xyflow/system';

import { useStoreApi } from '../../hooks/useStore';
import { useNodeId } from '../../contexts/NodeIdContext';
import type { ResizeControlProps, ResizeControlLineProps } from './types';

const ResizeControl: Component<ResizeControlProps> = (props) => {
  const contextNodeId = useNodeId();
  const nodeId = createMemo(() => (typeof props.nodeId === 'string' ? props.nodeId : contextNodeId));
  const store = useStoreApi();
  const [resizeControlRef, setResizeControlRef] = createSignal<HTMLDivElement | undefined>(undefined);
  const [resizer, setResizer] = createSignal<XYResizerInstance | null>(null);

  const defaultPosition = createMemo(() => (props.variant === ResizeControlVariant.Line ? 'right' : 'bottom-right'));
  const controlPosition = createMemo(() => props.position ?? defaultPosition());

  createEffect(() => {
    if (!resizeControlRef || !nodeId()) {
      return;
    }

    if (!resizer()) {
      const newResizer = XYResizer({
        domNode: resizeControlRef(),
        nodeId: nodeId(),
        getStoreItems: () => {
          const { nodeLookup, transform, snapGrid, snapToGrid, nodeOrigin, domNode } = store.getState();
          return {
            nodeLookup,
            transform,
            snapGrid,
            snapToGrid,
            nodeOrigin,
            paneDomNode: domNode,
          };
        },
        onChange: (change: XYResizerChange, childChanges: XYResizerChildChange[]) => {
          const { nodeLookup, parentLookup, nodeOrigin } = store.getState();
          const { triggerNodeChanges } = store.getActions();
          const changes: NodeChange[] = [];
          const nextPosition = { x: change.x, y: change.y };
          const node = nodeLookup.get(nodeId());

          if (node && node.expandParent && node.parentId) {
            const origin = node.origin ?? nodeOrigin;
            const width = change.width ?? node.measured.width ?? 0;
            const height = change.height ?? node.measured.height ?? 0;

            const child: ParentExpandChild = {
              id: node.id,
              parentId: node.parentId,
              rect: {
                width,
                height,
                ...evaluateAbsolutePosition(
                  {
                    x: change.x ?? node.position.x,
                    y: change.y ?? node.position.y,
                  },
                  { width, height },
                  node.parentId,
                  nodeLookup,
                  origin
                ),
              },
            };

            const parentExpandChanges = handleExpandParent([child], nodeLookup, parentLookup, nodeOrigin);
            changes.push(...parentExpandChanges);

            nextPosition.x = change.x ? Math.max(origin[0] * width, change.x) : undefined;
            nextPosition.y = change.y ? Math.max(origin[1] * height, change.y) : undefined;
          }

          if (nextPosition.x !== undefined && nextPosition.y !== undefined) {
            const positionChange: NodePositionChange = {
              id: nodeId(),
              type: 'position',
              position: { ...(nextPosition as XYPosition) },
            };
            changes.push(positionChange);
          }

          if (change.width !== undefined && change.height !== undefined) {
            const dimensionChange: NodeDimensionChange = {
              id: nodeId(),
              type: 'dimensions',
              resizing: true,
              setAttributes: true,
              dimensions: {
                width: change.width,
                height: change.height,
              },
            };

            changes.push(dimensionChange);
          }

          for (const childChange of childChanges) {
            const positionChange: NodePositionChange = {
              ...childChange,
              type: 'position',
            };

            changes.push(positionChange);
          }

          triggerNodeChanges(changes);
        },
        onEnd: () => {
          const dimensionChange: NodeDimensionChange = {
            id: nodeId(),
            type: 'dimensions',
            resizing: false,
          };
          store.getActions().triggerNodeChanges([dimensionChange]);
        },
      });

      setResizer(newResizer);
    }

    resizer()?.update({
      controlPosition: controlPosition(),
      boundaries: {
        minWidth: props.minWidth ?? 10,
        minHeight: props.minHeight ?? 10,
        maxWidth: props.maxWidth ?? Number.MAX_VALUE,
        maxHeight: props.maxHeight ?? Number.MAX_VALUE,
      },
      keepAspectRatio: props.keepAspectRatio ?? false,
      onResizeStart: props.onResizeStart,
      onResize: props.onResize,
      onResizeEnd: props.onResizeEnd,
      shouldResize: props.shouldResize,
    });

    onCleanup(() => {
      resizer()?.destroy();
    });
  });

  const colorStyleProp = createMemo(() =>
    props.variant === ResizeControlVariant.Line ? 'borderColor' : 'backgroundColor'
  );
  const controlStyle = createMemo(() =>
    props.color ? { ...props.style, [colorStyleProp()]: props.color } : props.style
  );

  const resolved = children(() => props.children);
  return (
    <div
      class={cc(['solid-flow__resize-control', 'nodrag', ...controlPosition().split('-'), props.variant, props.class])}
      ref={setResizeControlRef}
      style={controlStyle()}
    >
      {resolved()}
    </div>
  );
};

export const ResizeControlLine: Component<ResizeControlLineProps> = (props) => {
  return <ResizeControl {...props} variant={ResizeControlVariant.Line} />;
};

/**
 * To create your own resizing UI, you can use the `NodeResizeControl` component where you can pass children (such as icons).
 * @public
 */
export const NodeResizeControl = ResizeControl;
