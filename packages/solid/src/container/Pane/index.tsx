/**
 * The user selection rectangle gets displayed when a user drags the mouse while pressing shift
 */

import { children, type Component, createMemo, createSignal, type JSX, splitProps } from 'solid-js';
import cc from 'classcat';
import {
  areSetsEqual,
  type EdgeChange,
  getEventPosition,
  getNodesInside,
  type NodeChange,
  SelectionMode,
} from '@xyflow/system';

import { UserSelection } from '../../components/UserSelection';
import { useStore, useStoreApi } from '../../hooks/useStore';
import { getSelectionChanges } from '../../utils';
import type { SolidFlowProps, SolidFlowStore } from '../../types';

type PaneProps = {
  isSelecting: boolean;
  selectionKeyPressed: boolean;
  children: JSX.Element;
} & Partial<
  Pick<
    SolidFlowProps,
    | 'selectionMode'
    | 'panOnDrag'
    | 'onSelectionStart'
    | 'onSelectionEnd'
    | 'onPaneClick'
    | 'onPaneContextMenu'
    | 'onPaneScroll'
    | 'onPaneMouseEnter'
    | 'onPaneMouseMove'
    | 'onPaneMouseLeave'
    | 'selectionOnDrag'
  >
>;

const wrapHandler = (
  handler: ((event: MouseEvent) => void) | undefined,
  containerRef: HTMLDivElement | null
): ((event: MouseEvent) => void) => {
  return (event: MouseEvent) => {
    if (event.target !== containerRef) {
      return;
    }
    handler?.(event);
  };
};

const selector = (s: SolidFlowStore) => ({
  userSelectionActive: s.userSelectionActive,
  elementsSelectable: s.elementsSelectable,
  dragging: s.paneDragging,
});

export const Pane: Component<PaneProps> = (props) => {
  const [local] = splitProps(props, [
    'isSelecting',
    'selectionKeyPressed',
    'selectionMode',
    'panOnDrag',
    'selectionOnDrag',
    'onSelectionStart',
    'onSelectionEnd',
    'onPaneClick',
    'onPaneContextMenu',
    'onPaneScroll',
    'onPaneMouseEnter',
    'onPaneMouseMove',
    'onPaneMouseLeave',
    'children',
  ]);

  const store = useStoreApi();
  const { userSelectionActive, elementsSelectable, dragging } = useStore(selector);
  const hasActiveSelection = createMemo(() => elementsSelectable && (local.isSelecting || userSelectionActive));

  const [containerRef, setContainerRef] = createSignal<HTMLDivElement | undefined>(undefined);
  const containerBounds = { current: undefined as DOMRect | undefined };

  const selectedNodeIds = { current: new Set<string>() };
  const selectedEdgeIds = { current: new Set<string>() };

  // Used to prevent click events when the user lets go of the selectionKey during a selection
  const [selectionInProgress, setSelectionInProgress] = createSignal<boolean>(false);
  const [selectionStarted, setSelectionStarted] = createSignal<boolean>(false);

  const onClick = (event: MouseEvent) => {
    // We prevent click events when the user let go of the selectionKey during a selection
    if (selectionInProgress()) {
      setSelectionInProgress(false);
      return;
    }

    local.onPaneClick?.(event);
    store.getActions().resetSelectedElements();
    store.setState({ nodesSelectionActive: false });
  };

  const onContextMenu = (event: MouseEvent) => {
    if (Array.isArray(local.panOnDrag) && local.panOnDrag?.includes(2)) {
      event.preventDefault();
      return;
    }

    local.onPaneContextMenu?.(event);
  };

  const onWheel = (event: WheelEvent) => {
    local.onPaneScroll?.(event);
  };

  const onPointerDown = (event: PointerEvent): void => {
    const { resetSelectedElements } = store.getActions();
    const { domNode } = store.getState();
    containerBounds.current = domNode?.getBoundingClientRect();

    if (
      !elementsSelectable ||
      !local.isSelecting ||
      event.button !== 0 ||
      event.target !== containerRef() ||
      !containerBounds.current
    ) {
      return;
    }

    (event.target as Partial<Element> | null)?.setPointerCapture?.(event.pointerId);

    setSelectionStarted(true);
    setSelectionInProgress(false);

    const { x, y } = getEventPosition(event, containerBounds.current);

    resetSelectedElements();

    store.setState({
      userSelectionRect: {
        width: 0,
        height: 0,
        startX: x,
        startY: y,
        x,
        y,
      },
    });

    local.onSelectionStart?.(event as unknown as MouseEvent);
  };

  const onPointerMove = (event: PointerEvent): void => {
    const { userSelectionRect, transform, nodeLookup, edgeLookup, connectionLookup, defaultEdgeOptions } =
      store.getState();
    const { triggerNodeChanges, triggerEdgeChanges } = store.getActions();

    if (!containerBounds.current || !userSelectionRect) {
      return;
    }

    setSelectionInProgress(true);

    const { x: mouseX, y: mouseY } = getEventPosition(event, containerBounds.current);
    const { startX, startY } = userSelectionRect;

    const nextUserSelectRect = {
      startX,
      startY,
      x: mouseX < startX ? mouseX : startX,
      y: mouseY < startY ? mouseY : startY,
      width: Math.abs(mouseX - startX),
      height: Math.abs(mouseY - startY),
    };

    const prevSelectedNodeIds = selectedNodeIds.current;
    const prevSelectedEdgeIds = selectedEdgeIds.current;

    selectedNodeIds.current = new Set(
      getNodesInside(
        nodeLookup,
        nextUserSelectRect,
        transform,
        local.selectionMode === SelectionMode.Partial,
        true
      ).map((node) => node.id)
    );

    selectedEdgeIds.current = new Set();
    const edgesSelectable = defaultEdgeOptions?.selectable ?? true;

    // We look for all edges connected to the selected nodes
    for (const nodeId of selectedNodeIds.current) {
      const connections = connectionLookup.get(nodeId);
      if (!connections) continue;
      for (const { edgeId } of connections.values()) {
        const edge = edgeLookup.get(edgeId);
        if (edge && (edge.selectable ?? edgesSelectable)) {
          selectedEdgeIds.current.add(edgeId);
        }
      }
    }

    if (!areSetsEqual(prevSelectedNodeIds, selectedNodeIds.current)) {
      const changes = getSelectionChanges(nodeLookup, selectedNodeIds.current, true) as NodeChange[];
      triggerNodeChanges(changes);
    }

    if (!areSetsEqual(prevSelectedEdgeIds, selectedEdgeIds.current)) {
      const changes = getSelectionChanges(edgeLookup, selectedEdgeIds.current) as EdgeChange[];
      triggerEdgeChanges(changes);
    }

    store.setState({
      userSelectionRect: nextUserSelectRect,
      userSelectionActive: true,
      nodesSelectionActive: false,
    });
  };

  const onPointerUp = (event: PointerEvent) => {
    if (event.button !== 0 || !selectionStarted()) {
      return;
    }

    (event.target as Partial<Element>)?.releasePointerCapture?.(event.pointerId);
    const { userSelectionRect } = store.getState();

    /*
     * We only want to trigger click functions when in selection mode if
     * the user did not move the mouse.
     */
    if (!userSelectionActive && userSelectionRect && event.target === containerRef()) {
      onClick(event as unknown as MouseEvent);
    }

    store.setState({
      userSelectionActive: false,
      userSelectionRect: null,
      nodesSelectionActive: selectedNodeIds.current.size > 0,
    });
    local.onSelectionEnd?.(event as unknown as MouseEvent);

    /*
     * If the user kept holding the selectionKey during the selection,
     * we need to reset the selectionInProgress, so the next click event is not prevented
     */
    if (local.selectionKeyPressed || local.selectionOnDrag) {
      setSelectionInProgress(false);
    }

    setSelectionStarted(false);
  };

  const draggable = createMemo(
    () => local.panOnDrag === true || (Array.isArray(local.panOnDrag) && local.panOnDrag.includes(0))
  );

  // Event handler wrappers for JSX
  const handleClick = (e: MouseEvent) => {
    if (!hasActiveSelection()) {
      wrapHandler(onClick, containerRef())(e);
    }
  };

  const handleContextMenu = (e: MouseEvent) => {
    wrapHandler(onContextMenu, containerRef())(e);
  };

  const handleWheel = (e: WheelEvent) => {
    if (local.onPaneScroll) {
      wrapHandler(onWheel, containerRef())(e);
    }
  };

  const handlePointerEnter = (e: PointerEvent) => {
    if (!hasActiveSelection()) {
      local.onPaneMouseEnter?.(e as unknown as MouseEvent);
    }
  };

  const handlePointerDown = (e: PointerEvent) => {
    if (hasActiveSelection()) {
      onPointerDown(e);
    } else {
      local.onPaneMouseMove?.(e as unknown as MouseEvent);
    }
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (hasActiveSelection()) {
      onPointerMove(e);
    } else {
      local.onPaneMouseMove?.(e as unknown as MouseEvent);
    }
  };

  const handlePointerUp = (e: PointerEvent) => {
    if (hasActiveSelection()) {
      onPointerUp(e);
    }
  };

  const handlePointerLeave = (e: PointerEvent) => {
    local.onPaneMouseLeave?.(e as unknown as MouseEvent);
  };

  const resolved = children(() => local.children);
  return (
    <div
      class={cc(['solid-flow__pane', { draggable: draggable(), dragging, selection: local.isSelecting }])}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onWheel={handleWheel}
      onPointerEnter={handlePointerEnter}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      ref={setContainerRef}
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        top: '0',
        left: '0',
      }}
    >
      {resolved()}
      <UserSelection />
    </div>
  );
};
