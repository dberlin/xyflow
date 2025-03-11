import { children, type Component, type JSX } from 'solid-js';
import { Portal, Show } from 'solid-js/web';

import { useStore } from '../../hooks/useStore';
import type { SolidFlowStore } from '../../types';

const selector = (s: SolidFlowStore) => s.domNode?.querySelector('.solid-flow__viewport-portal');

/**
 * The `<ViewportPortal />` component can be used to add components to the same viewport
 * of the flow where nodes and edges are rendered. This is useful when you want to render
 * your own components that are adhere to the same coordinate system as the nodes & edges
 * and are also affected by zooming and panning
 * @public
 * @example
 *
 * ```jsx
 *import { ViewportPortal } from '@xyflow/solid';
 *
 *export default function () {
 *  return (
 *    <ViewportPortal>
 *      <div
 *        style={{ transform: 'translate(100px, 100px)', position: 'absolute' }}
 *      >
 *        This div is positioned at [100, 100] on the flow.
 *      </div>
 *    </ViewportPortal>
 *  );
 *}
 *```
 */
type ViewportPortalProps = {
  children: JSX.Element;
};
export const ViewportPortal: Component<ViewportPortalProps> = (props) => {
  const viewPortalDiv = useStore(selector);
  const resolved = children(() => props.children);

  return (
    <Show when={viewPortalDiv}>
      <Portal mount={viewPortalDiv}>{resolved()}</Portal>
    </Show>
  );
};
