import { Component, mergeProps, Show } from 'solid-js';
import type { BaseEdgeProps } from '../../types';
import { EdgeLabel } from '../EdgeLabel/EdgeLabel';
import cc from 'classcat';

export const BaseEdge: Component<BaseEdgeProps> = (props) => {
  const mergedProps = mergeProps({ interactionWidth: 20 }, props);

  return (
    <>
      <path
        id={mergedProps.id}
        d={mergedProps.path}
        class={cc(['solid-flow__edge-path', mergedProps.class])}
        marker-start={mergedProps.markerStart}
        marker-end={mergedProps.markerEnd}
        fill="none"
        style={mergedProps.style}
      />

      <Show when={mergedProps.interactionWidth > 0}>
        <path
          d={mergedProps.path}
          stroke-opacity={0}
          stroke-width={mergedProps.interactionWidth}
          fill="none"
          class="solid-flow__edge-interaction"
        />
      </Show>

      <Show when={mergedProps.label}>
        <EdgeLabel x={mergedProps.labelX} y={mergedProps.labelY} style={mergedProps.labelStyle}>
          {mergedProps.label}
        </EdgeLabel>
      </Show>
    </>
  );
};
export default BaseEdge;
