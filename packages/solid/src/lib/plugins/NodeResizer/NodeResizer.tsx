import { Component, For, Show } from 'solid-js';
import ResizeControl from './ResizeControl';
import type { NodeResizerProps } from './types';
import { ResizeControlVariant, XY_RESIZER_HANDLE_POSITIONS, XY_RESIZER_LINE_POSITIONS } from '@xyflow/system';

export const NodeResizer: Component<NodeResizerProps> = (props: NodeResizerProps) => {
  return (
    <Show when={props.isVisible !== false}>
      <For each={XY_RESIZER_LINE_POSITIONS}>
        {(position) => (
          <ResizeControl
            class={props.lineClass}
            style={props.lineStyle}
            nodeId={props.nodeId}
            position={position}
            variant={ResizeControlVariant.Line}
            minWidth={props.minWidth}
            minHeight={props.minHeight}
            maxWidth={props.maxWidth}
            maxHeight={props.maxHeight}
            keepAspectRatio={props.keepAspectRatio}
            onResize={props.onResize}
            onResizeStart={props.onResizeStart}
            onResizeEnd={props.onResizeEnd}
          />
        )}
      </For>
      <For each={XY_RESIZER_HANDLE_POSITIONS}>
        {(position) => (
          <ResizeControl
            class={props.handleClass}
            style={props.handleStyle}
            nodeId={props.nodeId}
            position={position}
            minWidth={props.minWidth}
            minHeight={props.minHeight}
            maxWidth={props.maxWidth}
            maxHeight={props.maxHeight}
            keepAspectRatio={props.keepAspectRatio}
            onResize={props.onResize}
            onResizeStart={props.onResizeStart}
            onResizeEnd={props.onResizeEnd}
          />
        )}
      </For>
    </Show>
  );
};
