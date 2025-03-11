import { Component, For, JSX, splitProps } from 'solid-js';

import { useStore } from '../../hooks/useStore';
import { useVisibleEdgeIds } from '../../hooks/useVisibleEdgeIds';
import MarkerDefinitions from './MarkerDefinitions';
import { GraphViewProps } from '../GraphView';
import { EdgeWrapper } from '../../components/EdgeWrapper';
import type { Edge, Node, SolidFlowStore } from '../../types';

type EdgeRendererProps<EdgeType extends Edge = Edge> = Pick<
  GraphViewProps<Node, EdgeType>,
  | 'onEdgeClick'
  | 'onEdgeDoubleClick'
  | 'defaultMarkerColor'
  | 'onlyRenderVisibleElements'
  | 'onReconnect'
  | 'onEdgeContextMenu'
  | 'onEdgeMouseEnter'
  | 'onEdgeMouseMove'
  | 'onEdgeMouseLeave'
  | 'onReconnectStart'
  | 'onReconnectEnd'
  | 'reconnectRadius'
  | 'noPanClass'
  | 'rfId'
  | 'disableKeyboardA11y'
  | 'edgeTypes'
> & {
  children?: JSX.Element;
};

const selector = (s: SolidFlowStore) => ({
  edgesFocusable: s.edgesFocusable,
  edgesReconnectable: s.edgesReconnectable,
  elementsSelectable: s.elementsSelectable,
  connectionMode: s.connectionMode,
  onError: s.onError,
});

export const EdgeRenderer: Component<EdgeRendererProps> = (props) => {
  const [local] = splitProps(props, [
    'defaultMarkerColor',
    'onlyRenderVisibleElements',
    'rfId',
    'edgeTypes',
    'noPanClass',
    'onReconnect',
    'onEdgeContextMenu',
    'onEdgeMouseEnter',
    'onEdgeMouseMove',
    'onEdgeMouseLeave',
    'onEdgeClick',
    'reconnectRadius',
    'onEdgeDoubleClick',
    'onReconnectStart',
    'onReconnectEnd',
    'disableKeyboardA11y',
    'children',
  ]);

  const store = useStore(selector);

  return (
    <div class="solid-flow__edges">
      <MarkerDefinitions defaultColor={local.defaultMarkerColor} rfId={local.rfId} />

      <For each={useVisibleEdgeIds(local.onlyRenderVisibleElements)}>
        {(id) => (
          <EdgeWrapper
            id={id}
            edgesFocusable={store.edgesFocusable}
            edgesReconnectable={store.edgesReconnectable}
            elementsSelectable={store.elementsSelectable}
            noPanClass={local.noPanClass}
            onReconnect={local.onReconnect}
            onContextMenu={local.onEdgeContextMenu}
            onMouseEnter={local.onEdgeMouseEnter}
            onMouseMove={local.onEdgeMouseMove}
            onMouseLeave={local.onEdgeMouseLeave}
            onClick={local.onEdgeClick}
            reconnectRadius={local.reconnectRadius}
            onDoubleClick={local.onEdgeDoubleClick}
            onReconnectStart={local.onReconnectStart}
            onReconnectEnd={local.onReconnectEnd}
            rfId={local.rfId}
            onError={store.onError}
            edgeTypes={local.edgeTypes}
            disableKeyboardA11y={local.disableKeyboardA11y}
          />
        )}
      </For>
    </div>
  );
};
