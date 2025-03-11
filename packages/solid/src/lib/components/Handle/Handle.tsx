import { Component, createEffect, createMemo, onCleanup, splitProps, useContext } from 'solid-js';

import {
  areConnectionMapsEqual,
  ConnectionMode,
  type HandleConnection,
  handleConnectionChange,
  isMouseEvent,
  Position,
  XYHandle,
} from '@xyflow/system';

import { useStore } from '../../store';
import type { HandleProps } from '../../types';

import { NodeConnectableContext, NodeIdContext } from '../../types/contexts';
import cc from 'classcat';

export const Handle: Component<HandleProps> = (props) => {
  const [local, others] = splitProps(props, [
    'id',
    'type',
    'position',
    'style',
    'class',
    'isConnectable',
    'isValidConnection',
    'onconnect',
    'ondisconnect',
    'children',
  ]);
  const nodeId = useContext(NodeIdContext);
  const isConnectableContext = useContext(NodeConnectableContext);

  // Initialize default values for props
  const handleId = () => local.id || null;
  const type = () => local.type || 'source';
  const position = () => local.position || Position.Top;
  const isTarget = () => type() === 'target';

  // Determine if handle is connectable
  const isConnectable = createMemo(() =>
    local.isConnectable !== undefined ? local.isConnectable : isConnectableContext.value
  );

  // Get store
  const store = useStore();

  // Create connection tracking variables
  let prevConnections: Map<string, HandleConnection> | null = null;

  // Handle pointer down events
  function onPointerDown(event: MouseEvent | TouchEvent) {
    const isMouseTriggered = isMouseEvent(event);

    if ((isMouseTriggered && event.button === 0) || !isMouseTriggered) {
      if (!nodeId) return;

      XYHandle.onPointerDown(event, {
        handleId: handleId(),
        nodeId,
        isTarget: isTarget(),
        connectionRadius: store.connectionRadius,
        domNode: store.domNode,
        nodeLookup: store.nodeLookup,
        connectionMode: store.connectionMode,
        lib: 'solid',
        autoPanOnConnect: store.autoPanOnConnect,
        flowId: store.flowId,
        isValidConnection: local.isValidConnection ?? store.isValidConnection,
        updateConnection: store.updateConnection,
        cancelConnection: store.cancelConnection,
        panBy: store.panBy,
        onConnect: (connection) => {
          const edge = store.onedgecreate ? store.onedgecreate(connection) : connection;

          if (!edge) {
            return;
          }

          store.addEdge(edge);
          store.onconnect?.(connection);
        },
        onConnectStart: (event, startParams) => {
          store.onconnectstart?.(event, {
            nodeId: startParams.nodeId,
            handleId: startParams.handleId,
            handleType: startParams.handleType,
          });
        },
        onConnectEnd: (event, connectionState) => {
          store.onconnectend?.(event, connectionState);
        },
        getTransform: () => [store.viewport.x, store.viewport.y, store.viewport.zoom],
        getFromHandle: () => store.connection.fromHandle,
      });
    }
  }

  // Effect to track connections
  // Was $effect.pre() in Svelte
  // Maybe createRenderEffect is better?
  createEffect(() => {
    // We need to access edges to get notified about updates
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    store.edges;

    if (local.onconnect || local.ondisconnect) {
      const connections = store.connectionLookup.get(`${nodeId}-${type()}${handleId() ? `-${handleId()}` : ''}`);

      if (prevConnections && !areConnectionMapsEqual(connections, prevConnections)) {
        const _connections = connections ?? new Map();

        handleConnectionChange(prevConnections, _connections, local.ondisconnect);

        handleConnectionChange(_connections, prevConnections, local.onconnect);
      }

      prevConnections = connections ? new Map(connections) : new Map();
    }
  });

  // Memoize connection state values
  const connectionState = createMemo(() => {
    const { fromHandle, toHandle, isValid } = store.connection;

    const connectionInProcess = !!fromHandle;

    const connectingFrom =
      fromHandle?.nodeId === nodeId && fromHandle?.type === type() && fromHandle?.id === handleId();

    const connectingTo = toHandle?.nodeId === nodeId && toHandle?.type === type() && toHandle?.id === handleId();

    const isPossibleEndHandle =
      store.connectionMode === ConnectionMode.Strict
        ? fromHandle?.type !== type()
        : nodeId !== fromHandle?.nodeId || handleId() !== fromHandle?.id;

    const valid = connectingTo && isValid;

    return {
      connectionInProcess,
      connectingFrom,
      connectingTo,
      isPossibleEndHandle,
      valid,
    };
  });

  // Clean up connections on component unmount
  onCleanup(() => {
    prevConnections = null;
  });

  // We need to generate class names based on the connection state
  const getClassNames = createMemo(() => {
    const state = connectionState();

    const baseClasses = [
      'solid-flow__handle',
      `solid-flow__handle-${position()}`,
      'nodrag',
      'nopan',
      position(),
      local.class,
    ];

    if (state.valid) baseClasses.push('valid');
    if (state.connectingTo) baseClasses.push('connectingto');
    if (state.connectingFrom) baseClasses.push('connectingfrom');
    if (!isTarget()) baseClasses.push('source');
    if (isTarget()) baseClasses.push('target');
    if (isConnectable()) {
      baseClasses.push('connectable', 'connectablestart');
      if (isConnectable()) baseClasses.push('connectableend');
      if (isConnectable() && (!state.connectionInProcess || state.isPossibleEndHandle)) {
        baseClasses.push('connectionindicator');
      }
    }

    return cc(baseClasses);
  });

  return (
    <div
      {...others}
      data-handleid={handleId()}
      data-nodeid={nodeId}
      data-handlepos={position()}
      data-id={`${store.flowId}-${nodeId}-${handleId()}-${type()}`}
      class={getClassNames()}
      onMouseDown={onPointerDown}
      onTouchStart={onPointerDown}
      style={local.style}
      role="button"
      tabIndex={-1}
    >
      {local.children}
    </div>
  );
};
