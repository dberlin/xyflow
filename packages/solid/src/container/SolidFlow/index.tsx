import { children, createMemo, createSignal, JSX, onMount, splitProps } from 'solid-js';
import cc from 'classcat';
import { ConnectionLineType, infiniteExtent, isMacOs, PanOnScrollMode, SelectionMode } from '@xyflow/system';

import { A11yDescriptions } from '../../components/A11yDescriptions';
import { Attribution } from '../../components/Attribution';
import { SelectionListener } from '../../components/SelectionListener';
import { StoreUpdater } from '../../components/StoreUpdater';
import { useColorModeClass } from '../../hooks/useColorModeClass';
import { GraphView } from '../GraphView';
import { Wrapper } from './Wrapper';
import type { Edge, Node, SolidFlowProps } from '../../types';
import { defaultNodeOrigin, defaultViewport as initViewport } from './init-values';
import StoreContext from '../../contexts/StoreContext';
import { createStore } from '../../store';
import { BatchContext, createQueues } from '../../components/BatchProvider';
import { useStoreApi } from '../../hooks/useStore';

const wrapperStyle: JSX.CSSProperties = {
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  position: 'relative',
  'z-index': 0,
};

function SolidFlow<NodeType extends Node = Node, EdgeType extends Edge = Edge>(
  props: SolidFlowProps<NodeType, EdgeType>
) {
  const [local, rest] = splitProps(props, [
    'nodes',
    'edges',
    'defaultNodes',
    'defaultEdges',
    'class',
    'nodeTypes',
    'edgeTypes',
    'onNodeClick',
    'onEdgeClick',
    'onInit',
    'onMove',
    'onMoveStart',
    'onMoveEnd',
    'onConnect',
    'onConnectStart',
    'onConnectEnd',
    'onClickConnectStart',
    'onClickConnectEnd',
    'onNodeMouseEnter',
    'onNodeMouseMove',
    'onNodeMouseLeave',
    'onNodeContextMenu',
    'onNodeDoubleClick',
    'onNodeDragStart',
    'onNodeDrag',
    'onNodeDragStop',
    'onNodesDelete',
    'onEdgesDelete',
    'onDelete',
    'onSelectionChange',
    'onSelectionDragStart',
    'onSelectionDrag',
    'onSelectionDragStop',
    'onSelectionContextMenu',
    'onSelectionStart',
    'onSelectionEnd',
    'onBeforeDelete',
    'connectionMode',
    'connectionLineType',
    'connectionLineStyle',
    'connectionLineComponent',
    'connectionLineContainerStyle',
    'deleteKeyCode',
    'selectionKeyCode',
    'selectionOnDrag',
    'selectionMode',
    'panActivationKeyCode',
    'multiSelectionKeyCode',
    'zoomActivationKeyCode',
    'snapToGrid',
    'snapGrid',
    'onlyRenderVisibleElements',
    'selectNodesOnDrag',
    'nodesDraggable',
    'nodesConnectable',
    'nodesFocusable',
    'nodeOrigin',
    'edgesFocusable',
    'edgesReconnectable',
    'elementsSelectable',
    'defaultViewport',
    'minZoom',
    'maxZoom',
    'translateExtent',
    'preventScrolling',
    'nodeExtent',
    'defaultMarkerColor',
    'zoomOnScroll',
    'zoomOnPinch',
    'panOnScroll',
    'panOnScrollSpeed',
    'panOnScrollMode',
    'zoomOnDoubleClick',
    'panOnDrag',
    'onPaneClick',
    'onPaneMouseEnter',
    'onPaneMouseMove',
    'onPaneMouseLeave',
    'onPaneScroll',
    'onPaneContextMenu',
    'paneClickDistance',
    'nodeClickDistance',
    'children',
    'onReconnect',
    'onReconnectStart',
    'onReconnectEnd',
    'onEdgeContextMenu',
    'onEdgeDoubleClick',
    'onEdgeMouseEnter',
    'onEdgeMouseMove',
    'onEdgeMouseLeave',
    'reconnectRadius',
    'onNodesChange',
    'onEdgesChange',
    'noDragClass',
    'noWheelClass',
    'noPanClass',
    'fitView',
    'fitViewOptions',
    'connectOnClick',
    'attributionPosition',
    'proOptions',
    'defaultEdgeOptions',
    'elevateNodesOnSelect',
    'elevateEdgesOnSelect',
    'disableKeyboardA11y',
    'autoPanOnConnect',
    'autoPanOnNodeDrag',
    'autoPanSpeed',
    'connectionRadius',
    'isValidConnection',
    'onError',
    'style',
    'id',
    'nodeDragThreshold',
    'viewport',
    'onViewportChange',
    'width',
    'height',
    'colorMode',
    'debug',
    'onScroll',
  ]);

  const [divRef, setDivRef] = createSignal<HTMLDivElement | undefined>(undefined);

  // Undo scroll events, preventing viewport from shifting when nodes outside of it are focused
  const wrapperOnScroll: JSX.EventHandlerUnion<HTMLDivElement, Event> = (e) => {
    const target = e.currentTarget;
    target.scrollTo({ top: 0, left: 0 });

    // FIXME
    // Check if onScroll is a function before calling it
    if (typeof local.onScroll === 'function') {
      local.onScroll(e);
    }
  };

  const colorModeClass = createMemo(() => useColorModeClass(local.colorMode || 'light')());
  // We need to create the global store context before we resolve the children or it won't be available.
  const store = createStore({
    get nodes() {
      return props.nodes;
    },
    get edges() {
      return props.edges;
    },
    defaultNodes: props.defaultNodes,
    defaultEdges: props.defaultEdges,
    get width() {
      return props.width;
    },
    get height() {
      return props.height;
    },
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
  StoreContext.defaultValue = store;
  // createEffect(() => {
  //   store.setState('domNode', divRef());
  // });
  onMount(() => {
    store.setState('domNode', divRef());
    store.setState('width', 1600);
    store.setState('height', 1200);
  });
  BatchContext.defaultValue = createQueues(useStoreApi());
  const resolved = children(() => local.children);
  const mergedStyle = createMemo(() => {
    if (typeof local.style == 'object') {
      return { ...local.style, ...wrapperStyle };
    } else {
      return wrapperStyle;
    }
  });
  return (
    <div
      data-testid="solid-flow__wrapper"
      {...rest}
      onScroll={wrapperOnScroll}
      style={mergedStyle()}
      ref={setDivRef}
      class={cc(['solid-flow', local.class, colorModeClass()])}
      id={local.id}
    >
      <Wrapper
        nodes={local.nodes}
        edges={local.edges}
        width={local.width}
        height={local.height}
        fitView={local.fitView}
        nodeOrigin={local.nodeOrigin || defaultNodeOrigin}
        nodeExtent={local.nodeExtent}
      >
        <GraphView
          onInit={local.onInit}
          onNodeClick={local.onNodeClick}
          onEdgeClick={local.onEdgeClick}
          onNodeMouseEnter={local.onNodeMouseEnter}
          onNodeMouseMove={local.onNodeMouseMove}
          onNodeMouseLeave={local.onNodeMouseLeave}
          onNodeContextMenu={local.onNodeContextMenu}
          onNodeDoubleClick={local.onNodeDoubleClick}
          nodeTypes={local.nodeTypes}
          edgeTypes={local.edgeTypes}
          connectionLineType={local.connectionLineType || ConnectionLineType.Bezier}
          connectionLineStyle={local.connectionLineStyle}
          connectionLineComponent={local.connectionLineComponent}
          connectionLineContainerStyle={local.connectionLineContainerStyle}
          selectionKeyCode={local.selectionKeyCode || 'Shift'}
          selectionOnDrag={local.selectionOnDrag || false}
          selectionMode={local.selectionMode || SelectionMode.Full}
          deleteKeyCode={local.deleteKeyCode || 'Backspace'}
          multiSelectionKeyCode={local.multiSelectionKeyCode || (isMacOs() ? 'Meta' : 'Control')}
          panActivationKeyCode={local.panActivationKeyCode || 'Space'}
          zoomActivationKeyCode={local.zoomActivationKeyCode || (isMacOs() ? 'Meta' : 'Control')}
          onlyRenderVisibleElements={local.onlyRenderVisibleElements || false}
          defaultViewport={local.defaultViewport || initViewport}
          translateExtent={local.translateExtent || infiniteExtent}
          minZoom={local.minZoom || 0.5}
          maxZoom={local.maxZoom || 2}
          preventScrolling={local.preventScrolling !== false}
          zoomOnScroll={local.zoomOnScroll !== false}
          zoomOnPinch={local.zoomOnPinch !== false}
          zoomOnDoubleClick={local.zoomOnDoubleClick !== false}
          panOnScroll={local.panOnScroll || false}
          panOnScrollSpeed={local.panOnScrollSpeed || 0.5}
          panOnScrollMode={local.panOnScrollMode || PanOnScrollMode.Free}
          panOnDrag={local.panOnDrag !== false}
          onPaneClick={local.onPaneClick}
          onPaneMouseEnter={local.onPaneMouseEnter}
          onPaneMouseMove={local.onPaneMouseMove}
          onPaneMouseLeave={local.onPaneMouseLeave}
          onPaneScroll={local.onPaneScroll}
          onPaneContextMenu={local.onPaneContextMenu}
          paneClickDistance={local.paneClickDistance || 0}
          nodeClickDistance={local.nodeClickDistance || 0}
          onSelectionContextMenu={local.onSelectionContextMenu}
          onSelectionStart={local.onSelectionStart}
          onSelectionEnd={local.onSelectionEnd}
          onReconnect={local.onReconnect}
          onReconnectStart={local.onReconnectStart}
          onReconnectEnd={local.onReconnectEnd}
          onEdgeContextMenu={local.onEdgeContextMenu}
          onEdgeDoubleClick={local.onEdgeDoubleClick}
          onEdgeMouseEnter={local.onEdgeMouseEnter}
          onEdgeMouseMove={local.onEdgeMouseMove}
          onEdgeMouseLeave={local.onEdgeMouseLeave}
          reconnectRadius={local.reconnectRadius || 10}
          defaultMarkerColor={local.defaultMarkerColor || '#b1b1b7'}
          noDragClass={local.noDragClass || 'nodrag'}
          noWheelClass={local.noWheelClass || 'nowheel'}
          noPanClass={local.noPanClass || 'nopan'}
          rfId={local.id || '1'}
          disableKeyboardA11y={local.disableKeyboardA11y || false}
          nodeExtent={local.nodeExtent}
          viewport={local.viewport}
          onViewportChange={local.onViewportChange}
        />
        <StoreUpdater
          nodes={local.nodes}
          edges={local.edges}
          defaultNodes={local.defaultNodes}
          defaultEdges={local.defaultEdges}
          onConnect={local.onConnect}
          onConnectStart={local.onConnectStart}
          onConnectEnd={local.onConnectEnd}
          onClickConnectStart={local.onClickConnectStart}
          onClickConnectEnd={local.onClickConnectEnd}
          nodesDraggable={local.nodesDraggable}
          nodesConnectable={local.nodesConnectable}
          nodesFocusable={local.nodesFocusable}
          edgesFocusable={local.edgesFocusable}
          edgesReconnectable={local.edgesReconnectable}
          elementsSelectable={local.elementsSelectable !== false}
          elevateNodesOnSelect={local.elevateNodesOnSelect}
          elevateEdgesOnSelect={local.elevateEdgesOnSelect}
          minZoom={local.minZoom || 0.5}
          maxZoom={local.maxZoom || 2}
          nodeExtent={local.nodeExtent}
          onNodesChange={local.onNodesChange}
          onEdgesChange={local.onEdgesChange}
          snapToGrid={local.snapToGrid}
          snapGrid={local.snapGrid}
          connectionMode={local.connectionMode}
          translateExtent={local.translateExtent || infiniteExtent}
          connectOnClick={local.connectOnClick}
          defaultEdgeOptions={local.defaultEdgeOptions}
          fitView={local.fitView}
          fitViewOptions={local.fitViewOptions}
          onNodesDelete={local.onNodesDelete}
          onEdgesDelete={local.onEdgesDelete}
          onDelete={local.onDelete}
          onNodeDragStart={local.onNodeDragStart}
          onNodeDrag={local.onNodeDrag}
          onNodeDragStop={local.onNodeDragStop}
          onSelectionDrag={local.onSelectionDrag}
          onSelectionDragStart={local.onSelectionDragStart}
          onSelectionDragStop={local.onSelectionDragStop}
          onMove={local.onMove}
          onMoveStart={local.onMoveStart}
          onMoveEnd={local.onMoveEnd}
          noPanClass={local.noPanClass || 'nopan'}
          nodeOrigin={local.nodeOrigin || defaultNodeOrigin}
          rfId={local.id || '1'}
          autoPanOnConnect={local.autoPanOnConnect}
          autoPanOnNodeDrag={local.autoPanOnNodeDrag}
          autoPanSpeed={local.autoPanSpeed}
          onError={local.onError}
          connectionRadius={local.connectionRadius}
          isValidConnection={local.isValidConnection}
          selectNodesOnDrag={local.selectNodesOnDrag}
          nodeDragThreshold={local.nodeDragThreshold}
          onBeforeDelete={local.onBeforeDelete}
          paneClickDistance={local.paneClickDistance || 0}
          debug={local.debug}
        />
        <SelectionListener onSelectionChange={local.onSelectionChange} />
        {resolved()}
        <Attribution proOptions={local.proOptions} position={local.attributionPosition} />
        <A11yDescriptions rfId={local.id || '1'} disableKeyboardA11y={local.disableKeyboardA11y || false} />
      </Wrapper>
    </div>
  );
}

/**
 * The `<SolidFlow />` component is the heart of your Solid Flow application.
 * It renders your nodes and edges and handles user interaction
 *
 * @public
 *
 * @example
 * ```tsx
 *import { SolidFlow } from '@xyflow/solid'
 *
 *export default function Flow() {
 *  return (<SolidFlow
 *    nodes={...}
 *    edges={...}
 *    onNodesChange={...}
 *    ...
 *  />);
 *}
 *```
 */
export default SolidFlow;
