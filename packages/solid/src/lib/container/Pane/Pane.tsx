import { Component, createMemo, createSignal } from 'solid-js';
import { getEventPosition, getNodesInside, SelectionMode } from '@xyflow/system';

import type { Edge, Node } from '../../types';
import type { PaneProps } from './types';

export function wrapHandler(handler: (evt: MouseEvent) => void, container: HTMLDivElement): (evt: MouseEvent) => void {
  return (event: MouseEvent) => {
    if (event.target !== container) {
      return;
    }
    handler?.(event);
  };
}

export function toggleSelected<Item extends Node | Edge>(ids: Set<string>) {
  return (item: Item) => {
    const isSelected = ids.has(item.id);

    if (!!item.selected !== isSelected) {
      return { ...item, selected: isSelected };
    }

    return item;
  };
}

function isSetEqual(a: Set<string>, b: Set<string>) {
  if (a.size !== b.size) {
    return false;
  }

  for (const item of a) {
    if (!b.has(item)) {
      return false;
    }
  }

  return true;
}

export const Pane: Component<PaneProps> = (props: PaneProps) => {
  let container: HTMLDivElement | undefined;
  const [containerBounds, setContainerBounds] = createSignal<DOMRect | null>(null);
  const [selectedNodeIds, setSelectedNodeIds] = createSignal<Set<string>>(new Set());
  const [selectedEdgeIds, setSelectedEdgeIds] = createSignal<Set<string>>(new Set());
  // Used to prevent click events when the user lets go of the selectionKey during a selection
  const [selectionInProgress, setSelectionInProgress] = createSignal(false);

  const panOnDragActive = createMemo(() => props.store.panActivationKeyPressed || props.panOnDrag);

  const isSelecting = createMemo(
    () =>
      props.store.selectionKeyPressed ||
      !!props.store.selectionRect ||
      (props.selectionOnDrag && panOnDragActive() !== true)
  );

  const hasActiveSelection = createMemo(
    () => props.store.elementsSelectable && (isSelecting() || props.store.selectionRectMode === 'user')
  );

  function onClick(event: MouseEvent) {
    // We prevent click events when the user let go of the selectionKey during a selection
    if (selectionInProgress()) {
      setSelectionInProgress(false);
      return;
    }

    props.onpaneclick?.({ event });
    props.store.unselectNodesAndEdges();
    props.store.selectionRectMode = null;
  }

  // We start the selection process when the user clicks down on the pane
  function onPointerDown(event: PointerEvent) {
    setContainerBounds(container?.getBoundingClientRect() || null);
    const bounds = containerBounds();

    if (
      !props.store.elementsSelectable ||
      !isSelecting() ||
      event.button !== 0 ||
      event.target !== container ||
      !bounds
    ) {
      return;
    }

    (event.target as Partial<Element> | null)?.setPointerCapture?.(event.pointerId);

    const { x, y } = getEventPosition(event, bounds);

    props.store.unselectNodesAndEdges();

    props.store.selectionRect = {
      width: 0,
      height: 0,
      startX: x,
      startY: y,
      x,
      y,
    };

    // onSelectionStart?.(event);
  }

  function onPointerMove(event: PointerEvent) {
    const bounds = containerBounds();
    if (!isSelecting() || !bounds || !props.store.selectionRect) {
      return;
    }

    setSelectionInProgress(true);

    const mousePos = getEventPosition(event, bounds);
    const { startX = 0, startY = 0 } = props.store.selectionRect;

    const nextUserSelectRect = {
      ...props.store.selectionRect,
      x: mousePos.x < startX ? mousePos.x : startX,
      y: mousePos.y < startY ? mousePos.y : startY,
      width: Math.abs(mousePos.x - startX),
      height: Math.abs(mousePos.y - startY),
    };

    const prevSelectedNodeIds = selectedNodeIds();
    const prevSelectedEdgeIds = selectedEdgeIds();

    const newSelectedNodeIds = new Set(
      getNodesInside(
        props.store.nodeLookup,
        nextUserSelectRect,
        [props.store.viewport.x, props.store.viewport.y, props.store.viewport.zoom],
        props.store.selectionMode === SelectionMode.Partial,
        true
      ).map((n) => n.id)
    );

    const edgesSelectable = props.store.defaultEdgeOptions.selectable ?? true;
    const newSelectedEdgeIds = new Set<string>();

    // We look for all edges connected to the selected nodes
    for (const nodeId of newSelectedNodeIds) {
      const connections = props.store.connectionLookup.get(nodeId);
      if (!connections) continue;
      for (const { edgeId } of connections.values()) {
        const edge = props.store.edgeLookup.get(edgeId);
        if (edge && (edge.selectable ?? edgesSelectable)) {
          newSelectedEdgeIds.add(edgeId);
        }
      }
    }

    // this prevents unnecessary updates while updating the selection rectangle
    if (!isSetEqual(prevSelectedNodeIds, newSelectedNodeIds)) {
      props.store.nodes = props.store.nodes.map(toggleSelected(newSelectedNodeIds));
      setSelectedNodeIds(newSelectedNodeIds);
    }

    if (!isSetEqual(prevSelectedEdgeIds, newSelectedEdgeIds)) {
      props.store.edges = props.store.edges.map(toggleSelected(newSelectedEdgeIds));
      setSelectedEdgeIds(newSelectedEdgeIds);
    }

    props.store.selectionRectMode = 'user';
    props.store.selectionRect = nextUserSelectRect;
  }

  function onPointerUp(event: PointerEvent) {
    if (event.button !== 0) {
      return;
    }

    (event.target as Partial<Element> | null)?.releasePointerCapture?.(event.pointerId);

    // We only want to trigger click functions when in selection mode if
    // the user did not move the mouse.
    if (!isSelecting() && props.store.selectionRectMode === 'user' && event.target === container) {
      onClick?.(event);
    }
    props.store.selectionRect = null;

    if (selectedNodeIds().size > 0) {
      props.store.selectionRectMode = 'nodes';
    }

    // If the user kept holding the selectionKey during the selection,
    // we need to reset the selectionInProgress, so the next click event is not prevented
    if (props.store.selectionKeyPressed) {
      setSelectionInProgress(false);
    }

    // onSelectionEnd?.(event);
  }

  const onContextMenu = (event: MouseEvent) => {
    if (Array.isArray(props.panOnDrag) && props.panOnDrag.includes(2)) {
      event.preventDefault();
      return;
    }

    props.onpanecontextmenu?.({ event });
  };
  return (
    <div
      ref={container}
      class="solid-flow__pane"
      classList={{
        draggable: props.panOnDrag === true || (Array.isArray(props.panOnDrag) && props.panOnDrag.includes(0)),
        dragging: props.store.dragging,
        selection: isSelecting(),
      }}
      onClick={(e) => (hasActiveSelection() ? undefined : wrapHandler(onClick, container!)(e))}
      onPointerDown={(e) => (hasActiveSelection() ? onPointerDown(e) : undefined)}
      onPointerMove={(e) => (hasActiveSelection() ? onPointerMove(e) : undefined)}
      onPointerUp={(e) => (hasActiveSelection() ? onPointerUp(e) : undefined)}
      onContextMenu={(e) => wrapHandler(onContextMenu, container!)(e)}
    >
      {props.children}
    </div>
  );
};
