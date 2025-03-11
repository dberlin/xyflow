import { children, type Component, createEffect, createSignal, type JSX, mergeProps, Show, splitProps } from 'solid-js';
import cc from 'classcat';
import type { Rect } from '@xyflow/system';

import type { EdgeTextProps } from '../../types';

/**
 * You can use the `<EdgeText />` component as a helper component to display text
 * within your custom edges.
 *
 *@public
 *
 *@example
 *```jsx
 *import { EdgeText } from '@xyflow/solid';
 *
 *export function CustomEdgeLabel({ label }) {
 *  return (
 *    <EdgeText
 *      x={100}
 *      y={100}
 *      label={label}
 *      labelStyle={{ fill: 'white' }}
 *      labelShowBg
 *      labelBgStyle={{ fill: 'red' }}
 *      labelBgPadding={[2, 4]}
 *      labelBgBorderRadius={2}
 *    />
 *  );
 *}
 *```
 */
export const EdgeText: Component<EdgeTextProps> = (props) => {
  const defaultProps = {
    labelStyle: {},
    labelShowBg: true,
    labelBgStyle: {},
    labelBgPadding: [2, 4] as [number, number],
    labelBgBorderRadius: 2,
  };

  const merged = mergeProps(defaultProps, props);
  const [local, rest] = splitProps(merged, [
    'x',
    'y',
    'label',
    'labelStyle',
    'labelShowBg',
    'labelBgStyle',
    'labelBgPadding',
    'labelBgBorderRadius',
    'children',
    'class',
  ]);

  const [edgeTextBbox, setEdgeTextBbox] = createSignal<Rect>({ x: 1, y: 0, width: 0, height: 0 });
  const [edgeTextRef, setEdgeTextRef] = createSignal<SVGTextElement | undefined>(undefined);

  createEffect(() => {
    if (edgeTextRef()) {
      const textBbox = edgeTextRef().getBBox();

      setEdgeTextBbox({
        x: textBbox.x,
        y: textBbox.y,
        width: textBbox.width,
        height: textBbox.height,
      });
    }
  });

  const edgeTextClasses = () => cc(['solid-flow__edge-textwrapper', local.class]);
  const resolved = children(() => props.children);
  return (
    <Show when={typeof local.label !== 'undefined' && local.label}>
      <g
        transform={`translate(${local.x - edgeTextBbox().width / 2} ${local.y - edgeTextBbox().height / 2})`}
        class={edgeTextClasses()}
        visibility={edgeTextBbox().width ? 'visible' : 'hidden'}
        {...(rest as JSX.SvgSVGAttributes<SVGGElement>)}
      >
        <Show when={local.labelShowBg}>
          <rect
            width={edgeTextBbox().width + 2 * local.labelBgPadding[0]}
            x={-local.labelBgPadding[0]}
            y={-local.labelBgPadding[1]}
            height={edgeTextBbox().height + 2 * local.labelBgPadding[1]}
            class="solid-flow__edge-textbg"
            style={local.labelBgStyle}
            rx={local.labelBgBorderRadius}
            ry={local.labelBgBorderRadius}
          />
        </Show>
        <text
          class="solid-flow__edge-text"
          y={edgeTextBbox().height / 2}
          dy="0.3em"
          ref={setEdgeTextRef}
          style={local.labelStyle}
        >
          {local.label}
        </text>
        {resolved()}
      </g>
    </Show>
  );
};
