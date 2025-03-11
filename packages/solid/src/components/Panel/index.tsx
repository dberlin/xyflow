import { children, type Component, type JSX, splitProps } from 'solid-js';
import cc from 'classcat';
import type { PanelPosition } from '@xyflow/system';

import { useStore } from '../../hooks/useStore';
import type { SolidFlowState } from '../../types';

export type PanelProps = {
  position?: PanelPosition;
  children: JSX.Element;
  class?: string;
  style?: JSX.CSSProperties;
  ref?: HTMLDivElement | ((el: HTMLDivElement) => void);
} & Omit<JSX.HTMLAttributes<HTMLDivElement>, 'class' | 'style' | 'ref'>;

const selector = (s: SolidFlowState) => (s.userSelectionActive ? 'none' : 'all');

/**
 * The `<Panel />` component helps you position content above the viewport.
 * It is used internally by the [`<MiniMap />`](/api-reference/components/minimap)
 * and [`<Controls />`](/api-reference/components/controls) components.
 *
 * @public
 *
 * @example
 * ```jsx
 *import { SolidFlow, Background, Panel } from '@xyflow/solid';
 *
 *export default function Flow() {
 *  return (
 *    <SolidFlow nodes={[]} fitView>
 *      <Panel position="top-left">top-left</Panel>
 *      <Panel position="top-center">top-center</Panel>
 *      <Panel position="top-right">top-right</Panel>
 *      <Panel position="bottom-left">bottom-left</Panel>
 *      <Panel position="bottom-center">bottom-center</Panel>
 *      <Panel position="bottom-right">bottom-right</Panel>
 *    </SolidFlow>
 *  );
 *}
 *```
 */
export const Panel: Component<PanelProps> = (props) => {
  const [local, rest] = splitProps(props, ['position', 'children', 'class', 'style', 'ref']);
  const pointerEvents = useStore(selector);
  const resolved = children(() => props.children);
  return (
    <div
      class={cc(['solid-flow__panel', local.class, ...`${local.position || 'top-left'}`.split('-')])}
      style={{
        ...local.style,
        'pointer-events': pointerEvents,
      }}
      ref={local.ref}
      {...rest}
    >
      {resolved()}
    </div>
  );
};
