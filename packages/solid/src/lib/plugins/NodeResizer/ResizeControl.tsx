import { Component, createEffect, createSignal, mergeProps, onCleanup, onMount, useContext } from 'solid-js';
import { useStore } from '../../store';
import {
  type ControlPosition,
  ResizeControlVariant,
  XYResizer,
  type XYResizerChange,
  type XYResizerChildChange,
  type XYResizerInstance,
} from '@xyflow/system';
import type { ResizeControlProps } from './types';
import { useSolidFlow } from '../../hooks/useSolidFlow';
import { NodeIdContext } from '../../types/contexts';
import cc from 'classcat';

export const ResizeControl: Component<ResizeControlProps> = (props: ResizeControlProps) => {
  const defaultProps = {
    variant: ResizeControlVariant.Handle,
    position: undefined as ControlPosition | undefined,
    minWidth: 10,
    minHeight: 10,
    maxWidth: Number.MAX_VALUE,
    maxHeight: Number.MAX_VALUE,
    keepAspectRatio: false,
    class: '',
    style: '',
  };

  const mergedProps = mergeProps(defaultProps, props);
  const store = useStore();
  const { updateNode } = useSolidFlow();

  const getId = () => {
    return typeof mergedProps.nodeId === 'string' ? mergedProps.nodeId : useContext(NodeIdContext);
  };

  const [resizer, setResizer] = createSignal<XYResizerInstance | null>(null);
  let resizeControlRef: HTMLDivElement | undefined;

  const getControlPosition = () => {
    const defaultPosition = (
      mergedProps.variant === ResizeControlVariant.Line ? 'right' : 'bottom-right'
    ) as ControlPosition;
    return mergedProps.position ?? defaultPosition;
  };

  const getPositionClassNames = () => getControlPosition().split('-');

  const getControlStyle = () => {
    const colorStyleProp = mergedProps.variant === ResizeControlVariant.Line ? 'border-color' : 'background-color';
    return mergedProps.color
      ? `${mergedProps.style || ''} ${colorStyleProp}: ${mergedProps.color};`
      : mergedProps.style || '';
  };

  onMount(() => {
    if (resizeControlRef) {
      const resizerInstance = XYResizer({
        domNode: resizeControlRef,
        nodeId: getId(),
        getStoreItems: () => {
          return {
            nodeLookup: store.nodeLookup,
            transform: [store.viewport.x, store.viewport.y, store.viewport.zoom],
            snapGrid: store.snapGrid ?? undefined,
            snapToGrid: !!store.snapGrid,
            nodeOrigin: store.nodeOrigin,
            paneDomNode: store.domNode,
          };
        },
        onChange: (change: XYResizerChange, childChanges: XYResizerChildChange[]) => {
          updateNode(getId(), (node) => ({
            ...node,
            position: { x: change.x ?? node.position.x, y: change.y ?? node.position.y },
            width: change.width ?? node.width,
            height: change.height ?? node.height,
          }));

          // TODO: performance?
          for (const childChange of childChanges) {
            updateNode(childChange.id, (node) => ({
              ...node,
              position: childChange.position,
            }));
          }
        },
      });

      setResizer(resizerInstance);

      onCleanup(() => {
        resizerInstance.destroy();
      });
    }
  });

  // Was $effect.pre() in Svelte
  // Maybe createRenderEffect is better?
  createEffect(() => {
    const resizerInstance = resizer();
    if (resizerInstance) {
      resizerInstance.update({
        controlPosition: getControlPosition(),
        boundaries: {
          minWidth: mergedProps.minWidth,
          minHeight: mergedProps.minHeight,
          maxWidth: mergedProps.maxWidth,
          maxHeight: mergedProps.maxHeight,
        },
        keepAspectRatio: !!mergedProps.keepAspectRatio,
        onResizeStart: mergedProps.onResizeStart,
        onResize: mergedProps.onResize,
        onResizeEnd: mergedProps.onResizeEnd,
        shouldResize: mergedProps.shouldResize,
      });
    }
  });

  return (
    <div
      class={cc([
        'solid-flow__resize-control',
        'nodrag',
        ...getPositionClassNames(),
        mergedProps.variant,
        mergedProps.class,
      ])}
      ref={resizeControlRef}
      style={getControlStyle()}
    >
      {props.children}
    </div>
  );
};

export default ResizeControl;
