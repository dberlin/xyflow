import { children, type Component, type JSX, Show, useContext } from 'solid-js';

import StoreContext from '../../contexts/StoreContext';
import { SolidFlowProvider } from '../../components/SolidFlowProvider';
import type { Edge, Node } from '../../types';
import { CoordinateExtent, NodeOrigin } from '@xyflow/system';

type WrapperProps = {
  children: JSX.Element;
  nodes?: Node[];
  edges?: Edge[];
  defaultNodes?: Node[];
  defaultEdges?: Edge[];
  width?: number;
  height?: number;
  fitView?: boolean;
  nodeOrigin?: NodeOrigin;
  nodeExtent?: CoordinateExtent;
};

export const Wrapper: Component<WrapperProps> = (props) => {
  const isWrapped = useContext(StoreContext);
  const resolved = children(() => props.children);

  return (
    <Show when={!isWrapped} fallback={<>{resolved()}</>}>
      <SolidFlowProvider
        initialNodes={props.nodes}
        initialEdges={props.edges}
        defaultNodes={props.defaultNodes}
        defaultEdges={props.defaultEdges}
        initialWidth={props.width}
        initialHeight={props.height}
        fitView={props.fitView}
        nodeOrigin={props.nodeOrigin}
        nodeExtent={props.nodeExtent}
      >
        {resolved()}
      </SolidFlowProvider>
    </Show>
  );
};
