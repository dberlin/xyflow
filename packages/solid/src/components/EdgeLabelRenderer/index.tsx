import { children, type Component, type JSX, Show } from 'solid-js';
import { Portal } from 'solid-js/web';

import { useStore } from '../../hooks/useStore';
import type { SolidFlowStore } from '../../types';

const selector = (s: SolidFlowStore) => s.domNode?.querySelector('.solid-flow__edgelabel-renderer');

/**
 * Edges are SVG-based. If you want to render more complex labels you can use the
 * `<EdgeLabelRenderer />` component to access a div based renderer. This component
 * is a portal that renders the label in a `<div />` that is positioned on top of
 * the edges. You can see an example usage of the component in the [edge label renderer](/examples/edges/edge-label-renderer) example.
 * @public
 *
 * @example
 *```jsx
 *import { Component } from 'solid-js';
 *import { getBezierPath, EdgeLabelRenderer, BaseEdge } from '@xyflow/solid';
 *
 *export const CustomEdge: Component = (props) => {
 *  const [edgePath, labelX, labelY] = getBezierPath(props);
 *
 *  return (
 *    <>
 *      <BaseEdge id={props.id} path={edgePath} />
 *      <EdgeLabelRenderer>
 *        <div
 *          style={{
 *            position: 'absolute',
 *            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
 *            background: '#ffcc00',
 *            padding: 10,
 *        }}
 *          class="nodrag nopan"
 *        >
 *         {props.data.label}
 *        </div>
 *      </EdgeLabelRenderer>
 *    </>
 *  );
 *};
 *```
 *
 * @remarks The `<EdgeLabelRenderer />` has no pointer events by default. If you want to
 * add mouse interactions you need to set the style `pointerEvents: all` and add
 * the `nopan` class on the label or the element you want to interact with.
 */
export const EdgeLabelRenderer: Component<{ children: JSX.Element }> = (props) => {
  const edgeLabelRenderer = useStore(selector);
  const resolved = children(() => props.children);

  return (
    <Show when={edgeLabelRenderer}>
      <Portal mount={edgeLabelRenderer}>{resolved()}</Portal>
    </Show>
  );
};
