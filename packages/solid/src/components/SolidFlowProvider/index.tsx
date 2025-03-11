import { children, type Component, type JSX } from 'solid-js';

import StoreContext from '../../contexts/StoreContext';
import { createStore } from '../../store';
import { BatchProvider } from '../BatchProvider';
import type { Edge, Node } from '../../types';
import type { CoordinateExtent, NodeOrigin } from '@xyflow/system';

export type SolidFlowProviderProps = {
  initialNodes?: Node[];
  initialEdges?: Edge[];
  defaultNodes?: Node[];
  defaultEdges?: Edge[];
  initialWidth?: number;
  initialHeight?: number;
  fitView?: boolean;
  nodeOrigin?: NodeOrigin;
  nodeExtent?: CoordinateExtent;
  children: JSX.Element;
};

/**
 * The `<SolidFlowProvider />` component is a [context provider](https://solid.dev/learn/passing-data-deeply-with-context#)
 * that makes it possible to access a flow's internal state outside of the
 * [`<SolidFlow />`](/api-reference/solid-flow) component. Many of the hooks we
 * provide rely on this component to work.
 * @public
 *
 * @example
 * ```tsx
 *import { SolidFlow, SolidFlowProvider, useNodes } from '@xyflow/solid'
 *
 *export default function Flow() {
 *  return (
 *    <SolidFlowProvider>
 *      <SolidFlow nodes={...} edges={...} />
 *      <Sidebar />
 *    </SolidFlowProvider>
 *  );
 *}
 *
 *function Sidebar() {
 *  // This hook will only work if the component it's used in is a child of a
 *  // <SolidFlowProvider />.
 *  const nodes = useNodes()
 *
 *  return <aside>do something with nodes</aside>;
 *}
 *```
 *
 * @remarks If you're using a router and want your flow's state to persist across routes,
 * it's vital that you place the `<SolidFlowProvider />` component _outside_ of
 * your router. If you have multiple flows on the same page you will need to use a separate
 * `<SolidFlowProvider />` for each flow.
 */
export const SolidFlowProvider: Component<SolidFlowProviderProps> = (props) => {
  const store = createStore({
    nodes: props.initialNodes,
    edges: props.initialEdges,
    defaultNodes: props.defaultNodes,
    defaultEdges: props.defaultEdges,
    width: props.initialWidth,
    height: props.initialHeight,
    get fitView() {
      return props.fitView;
    },
    get nodeOrigin() {
      return props.nodeOrigin;
    },
    get nodeExtent() {
      return props.nodeExtent;
    },
  });

  const resolved = children(() => props.children);

  return (
    <StoreContext.Provider value={store}>
      <BatchProvider>{resolved()}</BatchProvider>
    </StoreContext.Provider>
  );
};
