import { Component, For, Show } from 'solid-js';
import { ResizeControlVariant, XY_RESIZER_HANDLE_POSITIONS, XY_RESIZER_LINE_POSITIONS } from '@xyflow/system';

import { NodeResizeControl } from './NodeResizeControl';
import type { NodeResizerProps } from './types';

/**
 * The `<NodeResizer />` component can be used to add a resize functionality to your
 * nodes. It renders draggable controls around the node to resize in all directions.
 * @public
 *
 * @example
 *```jsx
 *import { memo } from 'react';
 *import { Handle, Position, NodeResizer } from '@xyflow/solid';
 *
 *function ResizableNode({ data }) {
 *  return (
 *    <>
 *      <NodeResizer minWidth={100} minHeight={30} />
 *      <Handle type="target" position={Position.Left} />
 *      <div style={{ padding: 10 }}>{data.label}</div>
 *      <Handle type="source" position={Position.Right} />
 *    </>
 *  );
 *};
 *
 *export default memo(ResizableNode);
 *```
 */
export const NodeResizer: Component<NodeResizerProps> = (props) => {
  return (
    <Show when={props.isVisible}>
      <>
        <For each={XY_RESIZER_LINE_POSITIONS}>
          {(position) => (
            <NodeResizeControl
              class={props.lineClass}
              style={props.lineStyle}
              nodeId={props.nodeId}
              position={position}
              variant={ResizeControlVariant.Line}
              color={props.color}
              minWidth={props.minWidth ?? 10}
              minHeight={props.minHeight ?? 10}
              maxWidth={props.maxWidth ?? Number.MAX_VALUE}
              maxHeight={props.maxHeight ?? Number.MAX_VALUE}
              onResizeStart={props.onResizeStart}
              keepAspectRatio={props.keepAspectRatio ?? false}
              shouldResize={props.shouldResize}
              onResize={props.onResize}
              onResizeEnd={props.onResizeEnd}
            />
          )}
        </For>
        <For each={XY_RESIZER_HANDLE_POSITIONS}>
          {(position) => (
            <NodeResizeControl
              class={props.handleClass}
              style={props.handleStyle}
              nodeId={props.nodeId}
              position={position}
              color={props.color}
              minWidth={props.minWidth ?? 10}
              minHeight={props.minHeight ?? 10}
              maxWidth={props.maxWidth ?? Number.MAX_VALUE}
              maxHeight={props.maxHeight ?? Number.MAX_VALUE}
              onResizeStart={props.onResizeStart}
              keepAspectRatio={props.keepAspectRatio ?? false}
              shouldResize={props.shouldResize}
              onResize={props.onResize}
              onResizeEnd={props.onResizeEnd}
            />
          )}
        </For>
      </>
    </Show>
  );
};
