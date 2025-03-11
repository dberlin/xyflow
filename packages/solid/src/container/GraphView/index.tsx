import { Component, createEffect, splitProps } from 'solid-js';

import { FlowRenderer } from '../FlowRenderer';
import { NodeRenderer } from '../NodeRenderer';
import { EdgeRenderer } from '../EdgeRenderer';
import { Viewport } from '../Viewport';
import { useOnInitHandler } from '../../hooks/useOnInitHandler';
import { useViewportSync } from '../../hooks/useViewportSync';
import { ConnectionLineWrapper } from '../../components/ConnectionLine';
import { useNodeOrEdgeTypesWarning } from './useNodeOrEdgeTypesWarning';
import type { Edge, Node, SolidFlowProps } from '../../types';
import { useStylesLoadedWarning } from './useStylesLoadedWarning';

export type GraphViewProps<NodeType extends Node = Node, EdgeType extends Edge = Edge> = Omit<
  SolidFlowProps<NodeType, EdgeType>,
  'onSelectionChange' | 'nodes' | 'edges' | 'onMove' | 'onMoveStart' | 'onMoveEnd' | 'elevateEdgesOnSelect'
> &
  Required<
    Pick<
      SolidFlowProps<NodeType, EdgeType>,
      | 'selectionKeyCode'
      | 'deleteKeyCode'
      | 'multiSelectionKeyCode'
      | 'connectionLineType'
      | 'onlyRenderVisibleElements'
      | 'translateExtent'
      | 'minZoom'
      | 'maxZoom'
      | 'defaultMarkerColor'
      | 'noDragClass'
      | 'noWheelClass'
      | 'noPanClass'
      | 'defaultViewport'
      | 'disableKeyboardA11y'
      | 'paneClickDistance'
      | 'nodeClickDistance'
    >
  > & {
    rfId: string;
  };

const GraphView: Component<GraphViewProps> = (props) => {
  const [local] = splitProps(props, [
    'nodeTypes',
    'edgeTypes',
    'onInit',
    'onNodeClick',
    'onEdgeClick',
    'onNodeDoubleClick',
    'onEdgeDoubleClick',
    'onNodeMouseEnter',
    'onNodeMouseMove',
    'onNodeMouseLeave',
    'onNodeContextMenu',
    'onSelectionContextMenu',
    'onSelectionStart',
    'onSelectionEnd',
    'connectionLineType',
    'connectionLineStyle',
    'connectionLineComponent',
    'connectionLineContainerStyle',
    'selectionKeyCode',
    'selectionOnDrag',
    'selectionMode',
    'multiSelectionKeyCode',
    'panActivationKeyCode',
    'zoomActivationKeyCode',
    'deleteKeyCode',
    'onlyRenderVisibleElements',
    'elementsSelectable',
    'defaultViewport',
    'translateExtent',
    'minZoom',
    'maxZoom',
    'preventScrolling',
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
    'onEdgeContextMenu',
    'onEdgeMouseEnter',
    'onEdgeMouseMove',
    'onEdgeMouseLeave',
    'reconnectRadius',
    'onReconnect',
    'onReconnectStart',
    'onReconnectEnd',
    'noDragClass',
    'noWheelClass',
    'noPanClass',
    'disableKeyboardA11y',
    'nodeExtent',
    'rfId',
    'viewport',
    'onViewportChange',
  ]);

  useStylesLoadedWarning();

  // Use createEffect to properly track reactive dependencies
  createEffect(() => {
    useNodeOrEdgeTypesWarning(local.nodeTypes);
    useNodeOrEdgeTypesWarning(local.edgeTypes);
    useOnInitHandler(local.onInit);
    useViewportSync(local.viewport);
  });

  return (
    <FlowRenderer
      onPaneClick={local.onPaneClick}
      onPaneMouseEnter={local.onPaneMouseEnter}
      onPaneMouseMove={local.onPaneMouseMove}
      onPaneMouseLeave={local.onPaneMouseLeave}
      onPaneContextMenu={local.onPaneContextMenu}
      onPaneScroll={local.onPaneScroll}
      paneClickDistance={local.paneClickDistance}
      deleteKeyCode={local.deleteKeyCode}
      selectionKeyCode={local.selectionKeyCode}
      selectionOnDrag={local.selectionOnDrag}
      selectionMode={local.selectionMode}
      onSelectionStart={local.onSelectionStart}
      onSelectionEnd={local.onSelectionEnd}
      multiSelectionKeyCode={local.multiSelectionKeyCode}
      panActivationKeyCode={local.panActivationKeyCode}
      zoomActivationKeyCode={local.zoomActivationKeyCode}
      elementsSelectable={local.elementsSelectable}
      zoomOnScroll={local.zoomOnScroll}
      zoomOnPinch={local.zoomOnPinch}
      zoomOnDoubleClick={local.zoomOnDoubleClick}
      panOnScroll={local.panOnScroll}
      panOnScrollSpeed={local.panOnScrollSpeed}
      panOnScrollMode={local.panOnScrollMode}
      panOnDrag={local.panOnDrag}
      defaultViewport={local.defaultViewport}
      translateExtent={local.translateExtent}
      minZoom={local.minZoom}
      maxZoom={local.maxZoom}
      onSelectionContextMenu={local.onSelectionContextMenu}
      preventScrolling={local.preventScrolling}
      noDragClass={local.noDragClass}
      noWheelClass={local.noWheelClass}
      noPanClass={local.noPanClass}
      disableKeyboardA11y={local.disableKeyboardA11y}
      onViewportChange={local.onViewportChange}
      isControlledViewport={!!local.viewport}
    >
      <Viewport>
        <EdgeRenderer
          edgeTypes={local.edgeTypes}
          onEdgeClick={local.onEdgeClick}
          onEdgeDoubleClick={local.onEdgeDoubleClick}
          onReconnect={local.onReconnect}
          onReconnectStart={local.onReconnectStart}
          onReconnectEnd={local.onReconnectEnd}
          onlyRenderVisibleElements={local.onlyRenderVisibleElements}
          onEdgeContextMenu={local.onEdgeContextMenu}
          onEdgeMouseEnter={local.onEdgeMouseEnter}
          onEdgeMouseMove={local.onEdgeMouseMove}
          onEdgeMouseLeave={local.onEdgeMouseLeave}
          reconnectRadius={local.reconnectRadius}
          defaultMarkerColor={local.defaultMarkerColor}
          noPanClass={local.noPanClass}
          disableKeyboardA11y={local.disableKeyboardA11y}
          rfId={local.rfId}
        />
        <ConnectionLineWrapper
          style={local.connectionLineStyle}
          type={local.connectionLineType}
          component={local.connectionLineComponent}
          containerStyle={local.connectionLineContainerStyle}
        />
        <div class="solid-flow__edgelabel-renderer" />
        <NodeRenderer
          nodeTypes={local.nodeTypes}
          onNodeClick={local.onNodeClick}
          onNodeDoubleClick={local.onNodeDoubleClick}
          onNodeMouseEnter={local.onNodeMouseEnter}
          onNodeMouseMove={local.onNodeMouseMove}
          onNodeMouseLeave={local.onNodeMouseLeave}
          onNodeContextMenu={local.onNodeContextMenu}
          nodeClickDistance={local.nodeClickDistance}
          onlyRenderVisibleElements={local.onlyRenderVisibleElements}
          noPanClass={local.noPanClass}
          noDragClass={local.noDragClass}
          disableKeyboardA11y={local.disableKeyboardA11y}
          nodeExtent={local.nodeExtent}
          rfId={local.rfId}
        />
        <div class="solid-flow__viewport-portal" />
      </Viewport>
    </FlowRenderer>
  );
};

export { GraphView };
