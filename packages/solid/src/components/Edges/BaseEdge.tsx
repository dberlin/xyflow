import { isNumeric } from '@xyflow/system';
import cc from 'classcat';
import { type Component } from 'solid-js';

import { EdgeText } from './EdgeText';
import type { BaseEdgeProps } from '../../types';

/**
 * The `<BaseEdge />` component gets used internally for all the edges. It can be
 * used inside a custom edge and handles the invisible helper edge and the edge label
 * for you.
 *
 * @public
 * @example
 * ```jsx
 *import { BaseEdge } from '@xyflow/solid';
 *
 *export function CustomEdge({ sourceX, sourceY, targetX, targetY, ...props }) {
 *  const [edgePath] = getStraightPath({
 *    sourceX,
 *    sourceY,
 *    targetX,
 *    targetY,
 *  });
 *
 *  return <BaseEdge path={edgePath} {...props} />;
 *}
 *```
 *
 * @remarks If you want to use an edge marker with the [`<BaseEdge />`](/api-reference/components/base-edge) component,
 * you can pass the `markerStart` or `markerEnd` props passed to your custom edge
 * through to the [`<BaseEdge />`](/api-reference/components/base-edge) component.
 * You can see all the props passed to a custom edge by looking at the [`EdgeProps`](/api-reference/types/edge-props) type.
 */
export const BaseEdge: Component<BaseEdgeProps> = (props) => {
  return (
    <>
      <path d={props.path} fill="none" class={cc(['solid-flow__edge-path', props.class])} {...props} />

      <path
        d={props.path}
        fill="none"
        stroke-opacity={0}
        stroke-width={props.interactionWidth ?? 20}
        class="solid-flow__edge-interaction"
      />

      {props.label && isNumeric(props.labelX) && isNumeric(props.labelY) ? (
        <EdgeText
          x={props.labelX}
          y={props.labelY}
          label={props.label}
          labelStyle={props.labelStyle}
          labelShowBg={props.labelShowBg}
          labelBgStyle={props.labelBgStyle}
          labelBgPadding={props.labelBgPadding}
          labelBgBorderRadius={props.labelBgBorderRadius}
        />
      ) : null}
    </>
  );
};
