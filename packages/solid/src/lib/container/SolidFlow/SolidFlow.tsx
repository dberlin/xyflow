import { ConnectionLineType, PanOnScrollMode } from '@xyflow/system';

import { createStore } from '../../store';
import { Zoom } from '../Zoom';
import { Pane } from '../Pane';
import { Viewport as ViewportComponent } from '../../container/Viewport';
import { NodeRenderer } from '../NodeRenderer';
import { EdgeRenderer } from '../EdgeRenderer';
import { NodeSelection } from '../../components/NodeSelection';
import { Selection } from '../../components/Selection';
import { KeyHandler } from '../../components/KeyHandler';
import { ConnectionLine } from '../../components/ConnectionLine';
import { Attribution } from '../../components/Attribution';
import type { SolidFlowProps } from './types';
import { type ProviderContext } from '../../store/types';
import Wrapper from './Wrapper';
import { Component, JSX, mergeProps, onCleanup, untrack, useContext } from 'solid-js';
import { FlowStoreContext } from '../../types/contexts';

export const SolidFlow: Component<SolidFlowProps & JSX.HTMLAttributes<HTMLDivElement>> = (
  props: SolidFlowProps & JSX.HTMLAttributes<HTMLDivElement>
) => {
  const mergedProps = mergeProps(
    {
      paneClickDistance: 1,
      nodeClickDistance: 1,
      panOnScrollMode: PanOnScrollMode.Free,
      preventScrolling: true,
      zoomOnScroll: true,
      zoomOnDoubleClick: true,
      zoomOnPinch: true,
      panOnScroll: false,
      panOnDrag: true,
      selectionOnDrag: true,
      connectionLineStyle: '',
      connectionLineContainerStyle: '',
      connectionLineType: ConnectionLineType.Bezier,
    },
    props
  );

  const store = createStore({
    width: untrack(() => mergedProps.width),
    height: untrack(() => mergedProps.height),
    set nodes(nodes) {
      mergedProps?.setNodes(nodes);
    },
    set edges(edges) {
      mergedProps?.setEdges(edges);
    },
    get nodes() {
      return mergedProps.nodes;
    },
    get edges() {
      return mergedProps.edges;
    },
    viewport: untrack(() => mergedProps.viewport),
    props: mergedProps,
  });

  // Set store for provider context
  const providerContext = useContext<ProviderContext>(FlowStoreContext);
  if (providerContext && providerContext.setStore) {
    providerContext.setStore(store);
  }

  // Overwrite store context to give children direct access
  const storeProvider: ProviderContext = {
    provider: false,
    getStore() {
      return store;
    },
    setStore: providerContext?.setStore,
  };

  onCleanup(() => {
    store.reset();
  });
  return (
    <FlowStoreContext.Provider value={storeProvider}>
      <Wrapper
        {...mergedProps}
        domNode={store.domNode}
        setDomNode={(x) => (store.domNode = x)}
        clientWidth={store.width}
        setClientWidth={(x) => (store.width = x)}
        clientHeight={store.height}
        setClientHeight={(x) => (store.height = x)}
        colorMode={store.colorMode}
        width={mergedProps.width}
        height={mergedProps.height}
      >
        <KeyHandler
          store={store}
          selectionKey={mergedProps.selectionKey}
          deleteKey={mergedProps.deleteKey}
          panActivationKey={mergedProps.panActivationKey}
          multiSelectionKey={mergedProps.multiSelectionKey}
          zoomActivationKey={mergedProps.zoomActivationKey}
        />
        <Zoom
          store={store}
          onMoveStart={mergedProps.onMoveStart}
          onMove={mergedProps.onMove}
          onMoveEnd={mergedProps.onMoveEnd}
          panOnScrollMode={mergedProps.panOnScrollMode}
          preventScrolling={mergedProps.preventScrolling}
          zoomOnScroll={mergedProps.zoomOnScroll}
          zoomOnDoubleClick={mergedProps.zoomOnDoubleClick}
          zoomOnPinch={mergedProps.zoomOnPinch}
          panOnScroll={mergedProps.panOnScroll}
          panOnDrag={mergedProps.panOnDrag}
          paneClickDistance={mergedProps.paneClickDistance}
        >
          <Pane
            store={store}
            onpaneclick={mergedProps.onpaneclick}
            onpanecontextmenu={mergedProps.onpanecontextmenu}
            panOnDrag={mergedProps.panOnDrag}
            selectionOnDrag={mergedProps.selectionOnDrag}
          >
            <ViewportComponent store={store}>
              <EdgeRenderer
                store={store}
                onedgeclick={mergedProps.onedgeclick}
                onedgecontextmenu={mergedProps.onedgecontextmenu}
                onedgepointerenter={mergedProps.onedgepointerenter}
                onedgepointerleave={mergedProps.onedgepointerleave}
              />
              <ConnectionLine
                store={store}
                type={mergedProps.connectionLineType}
                LineComponent={mergedProps.connectionLineComponent}
                containerStyle={mergedProps.connectionLineContainerStyle}
                style={mergedProps.connectionLineStyle}
              />
              <div class="solid-flow__edgelabel-renderer"></div>
              <div class="solid-flow__viewport-portal"></div>
              <NodeRenderer
                store={store}
                nodeClickDistance={mergedProps.nodeClickDistance}
                onnodeclick={mergedProps.onnodeclick}
                onnodecontextmenu={mergedProps.onnodecontextmenu}
                onnodepointerenter={mergedProps.onnodepointerenter}
                onnodepointermove={mergedProps.onnodepointermove}
                onnodepointerleave={mergedProps.onnodepointerleave}
                onnodedrag={mergedProps.onnodedrag}
                onnodedragstart={mergedProps.onnodedragstart}
                onnodedragstop={mergedProps.onnodedragstop}
              />
              <NodeSelection
                store={store}
                onselectionclick={mergedProps.onselectionclick}
                onselectioncontextmenu={mergedProps.onselectioncontextmenu}
                onnodedrag={mergedProps.onnodedrag}
                onnodedragstart={mergedProps.onnodedragstart}
                onnodedragstop={mergedProps.onnodedragstop}
              />
            </ViewportComponent>
            <Selection
              isVisible={!!(store.selectionRect && store.selectionRectMode === 'user')}
              width={store.selectionRect?.width}
              height={store.selectionRect?.height}
              x={store.selectionRect?.x}
              y={store.selectionRect?.y}
            />
          </Pane>
        </Zoom>
        <Attribution proOptions={mergedProps.proOptions} position={mergedProps.attributionPosition} />
        {mergedProps.children}
      </Wrapper>
    </FlowStoreContext.Provider>
  );
};
