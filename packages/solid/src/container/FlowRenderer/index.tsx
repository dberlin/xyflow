import { children, Component, createEffect, createMemo, type JSX, splitProps } from 'solid-js';

import { useStore } from '../../hooks/useStore';
import { useGlobalKeyHandler } from '../../hooks/useGlobalKeyHandler';
import { useKeyPress } from '../../hooks/useKeyPress';
import { GraphViewProps } from '../GraphView';
import { ZoomPane } from '../ZoomPane';
import { Pane } from '../Pane';
import { NodesSelection } from '../../components/NodesSelection';
import type { Node, SolidFlowStore } from '../../types';

export type FlowRendererProps<NodeType extends Node = Node> = Omit<
  GraphViewProps<NodeType>,
  | 'snapToGrid'
  | 'nodeTypes'
  | 'edgeTypes'
  | 'snapGrid'
  | 'connectionLineType'
  | 'connectionLineContainerStyle'
  | 'arrowHeadColor'
  | 'onlyRenderVisibleElements'
  | 'selectNodesOnDrag'
  | 'defaultMarkerColor'
  | 'rfId'
  | 'nodeClickDistance'
> & {
  isControlledViewport: boolean;
  children: JSX.Element;
};

const win = typeof window !== 'undefined' ? window : undefined;

const selector = (s: SolidFlowStore) => {
  return { nodesSelectionActive: s.nodesSelectionActive, userSelectionActive: s.userSelectionActive };
};

/**
 * FlowRenderer component for SolidJS
 */
export const FlowRenderer: Component<FlowRendererProps> = (props) => {
  const [local] = splitProps(props, [
    'children',
    'onPaneClick',
    'onPaneMouseEnter',
    'onPaneMouseMove',
    'onPaneMouseLeave',
    'onPaneContextMenu',
    'onPaneScroll',
    'paneClickDistance',
    'deleteKeyCode',
    'selectionKeyCode',
    'selectionOnDrag',
    'selectionMode',
    'onSelectionStart',
    'onSelectionEnd',
    'multiSelectionKeyCode',
    'panActivationKeyCode',
    'zoomActivationKeyCode',
    'elementsSelectable',
    'zoomOnScroll',
    'zoomOnPinch',
    'panOnScroll',
    'panOnScrollSpeed',
    'panOnScrollMode',
    'zoomOnDoubleClick',
    'panOnDrag',
    'defaultViewport',
    'translateExtent',
    'minZoom',
    'maxZoom',
    'preventScrolling',
    'onSelectionContextMenu',
    'noWheelClass',
    'noPanClass',
    'disableKeyboardA11y',
    'onViewportChange',
    'isControlledViewport',
  ]);

  const { nodesSelectionActive, userSelectionActive } = useStore(selector);

  // Initialize key press hooks with tracked dependencies
  const selectionKeyPressed = createMemo(() => useKeyPress(local.selectionKeyCode, { target: win })());
  const panActivationKeyPressed = createMemo(() => useKeyPress(local.panActivationKeyCode, { target: win })());

  // Set up global key handler
  createEffect(() => {
    useGlobalKeyHandler({
      deleteKeyCode: local.deleteKeyCode,
      multiSelectionKeyCode: local.multiSelectionKeyCode,
    });
  });

  const panOnDrag = createMemo(() => panActivationKeyPressed() || local.panOnDrag);
  const panOnScroll = createMemo(() => panActivationKeyPressed() || local.panOnScroll);
  const selectionOnDrag = createMemo(() => local.selectionOnDrag && panOnDrag() !== true);
  const isSelecting = createMemo(() => selectionKeyPressed() || userSelectionActive || selectionOnDrag());
  const resolved = children(() => local.children);
  return (
    <ZoomPane
      onPaneContextMenu={local.onPaneContextMenu}
      elementsSelectable={local.elementsSelectable}
      zoomOnScroll={local.zoomOnScroll}
      zoomOnPinch={local.zoomOnPinch}
      panOnScroll={panOnScroll()}
      panOnScrollSpeed={local.panOnScrollSpeed}
      panOnScrollMode={local.panOnScrollMode}
      zoomOnDoubleClick={local.zoomOnDoubleClick}
      panOnDrag={!selectionKeyPressed() && panOnDrag()}
      defaultViewport={local.defaultViewport}
      translateExtent={local.translateExtent}
      minZoom={local.minZoom}
      maxZoom={local.maxZoom}
      zoomActivationKeyCode={local.zoomActivationKeyCode}
      preventScrolling={local.preventScrolling}
      noWheelClass={local.noWheelClass}
      noPanClass={local.noPanClass}
      onViewportChange={local.onViewportChange}
      isControlledViewport={local.isControlledViewport}
      paneClickDistance={local.paneClickDistance}
    >
      <Pane
        onSelectionStart={local.onSelectionStart}
        onSelectionEnd={local.onSelectionEnd}
        onPaneClick={local.onPaneClick}
        onPaneMouseEnter={local.onPaneMouseEnter}
        onPaneMouseMove={local.onPaneMouseMove}
        onPaneMouseLeave={local.onPaneMouseLeave}
        onPaneContextMenu={local.onPaneContextMenu}
        onPaneScroll={local.onPaneScroll}
        panOnDrag={panOnDrag()}
        isSelecting={!!isSelecting()}
        selectionMode={local.selectionMode}
        selectionKeyPressed={selectionKeyPressed()}
        selectionOnDrag={selectionOnDrag()}
      >
        {resolved()}
        {nodesSelectionActive && (
          <NodesSelection
            onSelectionContextMenu={local.onSelectionContextMenu}
            noPanClass={local.noPanClass}
            disableKeyboardA11y={local.disableKeyboardA11y}
          />
        )}
      </Pane>
    </ZoomPane>
  );
};
