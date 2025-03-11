import cc from 'classcat';

import type { ControlButtonProps } from './types';
import { children, Component, splitProps } from 'solid-js';

/**
 * You can add buttons to the control panel by using the `<ControlButton />` component
 * and pass it as a child to the [`<Controls />`](/api-reference/components/controls) component.
 *
 * @public
 * @example
 *```jsx
 *import { MagicWand } from '@radix-ui/solid-icons'
 *import { SolidFlow, Controls, ControlButton } from '@xyflow/solid'
 *
 *export default function Flow() {
 *  return (
 *    <SolidFlow nodes={[...]} edges={[...]}>
 *      <Controls>
 *        <ControlButton onClick={() => alert('Something magical just happened. ✨')}>
 *          <MagicWand />
 *        </ControlButton>
 *      </Controls>
 *    </SolidFlow>
 *  )
 *}
 *```
 */
export const ControlButton: Component<ControlButtonProps> = (props) => {
  const [local, rest] = splitProps(props, ['class', 'children']);
  const resolved = children(() => local.children);
  return (
    <button type="button" class={cc(['solid-flow__controls-button', local.class])} {...rest}>
      {resolved()}
    </button>
  );
};
