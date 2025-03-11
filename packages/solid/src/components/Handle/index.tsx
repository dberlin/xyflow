import { children, type Component, createMemo, type JSX, splitProps } from 'solid-js';
import cc from 'classcat';
import {
  addEdge,
  type Connection,
  ConnectionMode,
  type ConnectionState,
  errorMessages,
  getHostForElement,
  type HandleProps as HandlePropsSystem,
  type HandleType,
  isMouseEvent,
  type OnConnect,
  type Optional,
  Position,
  XYHandle,
} from '@xyflow/system';

import { useStore, useStoreApi } from '../../hooks/useStore';
import { useNodeId } from '../../contexts/NodeIdContext';
import type { SolidFlowStore } from '../../types';

/**
 * @expand
 */
export type HandleProps = HandlePropsSystem &
  Omit<JSX.HTMLAttributes<HTMLDivElement>, 'id'> & {
    /** Callback called when connection is made */
    onConnect?: OnConnect;
  };

const selector = (s: SolidFlowStore) => ({
  connectOnClick: s.connectOnClick,
  noPanClass: s.noPanClass,
  rfId: s.rfId,
});

const connectingSelector =
  (nodeId: string | null, handleId: string | null, type: HandleType) => (state: SolidFlowStore) => {
    const { connectionClickStartHandle: clickHandle, connectionMode, connection } = state;
    const { fromHandle, toHandle, isValid } = connection;
    const connectingTo = toHandle?.nodeId === nodeId && toHandle?.id === handleId && toHandle?.type === type;

    return {
      connectingFrom: fromHandle?.nodeId === nodeId && fromHandle?.id === handleId && fromHandle?.type === type,
      connectingTo,
      clickConnecting: clickHandle?.nodeId === nodeId && clickHandle?.id === handleId && clickHandle?.type === type,
      isPossibleEndHandle:
        connectionMode === ConnectionMode.Strict
          ? fromHandle?.type !== type
          : nodeId !== fromHandle?.nodeId || handleId !== fromHandle?.id,
      connectionInProcess: !!fromHandle,
      clickConnectionInProcess: !!clickHandle,
      valid: connectingTo && isValid,
    };
  };

/**
 * The `<Handle />` component is used in your [custom nodes](/learn/customization/custom-nodes)
 * to define connection points.
 *
 *@public
 *
 *@example
 *
 *```jsx
 *import { Handle, Position } from '@xyflow/solid';
 *
 *export function CustomNode({ data }) {
 *  return (
 *    <>
 *      <div style={{ padding: '10px 20px' }}>
 *        {data.label}
 *      </div>
 *
 *      <Handle type="target" position={Position.Left} />
 *      <Handle type="source" position={Position.Right} />
 *    </>
 *  );
 *};
 *```
 */
export const Handle: Component<HandleProps> = (props) => {
  const [local, rest] = splitProps(props, [
    'type',
    'position',
    'isValidConnection',
    'isConnectable',
    'isConnectableStart',
    'isConnectableEnd',
    'id',
    'onConnect',
    'children',
    'class',
    'onMouseDown',
    'onTouchStart',
    'ref',
  ]);

  const getType = createMemo(() => local.type || 'source');
  const getPosition = createMemo(() => local.position || Position.Top);
  const getIsConnectable = createMemo(() => local.isConnectable !== false);
  const getIsConnectableStart = createMemo(() => local.isConnectableStart !== false);
  const getIsConnectableEnd = createMemo(() => local.isConnectableEnd !== false);
  const getHandleId = createMemo(() => local.id || null);
  const isTarget = createMemo(() => getType() === 'target');

  const store = useStoreApi();
  const nodeId = useNodeId();
  const { connectOnClick, noPanClass, rfId } = useStore(selector);

  const connectionState = createMemo(() => {
    return useStore(connectingSelector(nodeId, getHandleId(), getType()));
  });

  if (!nodeId) {
    store.getState().onError?.('010', errorMessages['error010']());
  }

  const onConnectExtended = (params: Connection) => {
    const { defaultEdgeOptions, onConnect: onConnectAction, hasDefaultEdges } = store.getState();

    const edgeParams = {
      ...defaultEdgeOptions,
      ...params,
    };
    if (hasDefaultEdges) {
      const { edges } = store.getState();
      const { setEdges } = store.getActions();
      setEdges(addEdge(edgeParams, edges));
    }

    onConnectAction?.(edgeParams);
    local.onConnect?.(edgeParams);
  };

  const handlePointerDown = (event: MouseEvent | TouchEvent) => {
    if (!nodeId) {
      return;
    }

    const isMouseTriggered = isMouseEvent(event);
    const currentHandleId = getHandleId();
    const currentIsConnectableStart = getIsConnectableStart();

    if (currentIsConnectableStart && ((isMouseTriggered && (event as MouseEvent).button === 0) || !isMouseTriggered)) {
      const currentStore = store.getState();
      const currentActions = store.getActions();

      XYHandle.onPointerDown(event, {
        autoPanOnConnect: currentStore.autoPanOnConnect,
        connectionMode: currentStore.connectionMode,
        connectionRadius: currentStore.connectionRadius,
        domNode: currentStore.domNode,
        nodeLookup: currentStore.nodeLookup,
        lib: currentStore.lib,
        isTarget: isTarget(),
        handleId: currentHandleId,
        nodeId,
        flowId: currentStore.rfId,
        panBy: currentActions.panBy,
        cancelConnection: currentActions.cancelConnection,
        onConnectStart: currentStore.onConnectStart,
        onConnectEnd: currentStore.onConnectEnd,
        updateConnection: currentActions.updateConnection,
        onConnect: onConnectExtended,
        isValidConnection: local.isValidConnection || currentStore.isValidConnection,
        getTransform: () => store.getState().transform,
        getFromHandle: () => store.getState().connection.fromHandle,
        autoPanSpeed: currentStore.autoPanSpeed,
      });
    }
  };

  const handleClick = (event: MouseEvent) => {
    const {
      onClickConnectStart,
      onClickConnectEnd,
      connectionClickStartHandle,
      connectionMode,
      isValidConnection: isValidConnectionStore,
      lib,
      rfId: flowId,
      nodeLookup,
      connection: connectionState,
    } = store.getState();

    const currentType = getType();
    const currentHandleId = getHandleId();
    const currentIsConnectableStart = getIsConnectableStart();

    if (!nodeId || (!connectionClickStartHandle && !currentIsConnectableStart)) {
      return;
    }

    if (!connectionClickStartHandle) {
      onClickConnectStart?.(event, { nodeId, handleId: currentHandleId, handleType: currentType });
      store.setState({ connectionClickStartHandle: { nodeId, type: currentType, id: currentHandleId } });
      return;
    }

    const doc = getHostForElement(event.target as Element);
    const isValidConnectionHandler = local.isValidConnection || isValidConnectionStore;
    const { connection, isValid } = XYHandle.isValid(event, {
      handle: {
        nodeId,
        id: currentHandleId,
        type: currentType,
      },
      connectionMode,
      fromNodeId: connectionClickStartHandle.nodeId,
      fromHandleId: connectionClickStartHandle.id || null,
      fromType: connectionClickStartHandle.type,
      isValidConnection: isValidConnectionHandler,
      flowId,
      doc,
      lib,
      nodeLookup,
    });

    if (isValid && connection) {
      onConnectExtended(connection);
    }

    const connectionClone = structuredClone(connectionState) as Optional<ConnectionState, 'inProgress'>;
    delete connectionClone.inProgress;
    connectionClone.toPosition = connectionClone.toHandle ? connectionClone.toHandle.position : null;
    onClickConnectEnd?.(event, connectionClone);

    store.setState({ connectionClickStartHandle: null });
  };
  const resolved = children(() => local.children);

  return (
    <div
      data-handleid={getHandleId()}
      data-nodeid={nodeId}
      data-handlepos={getPosition()}
      data-id={`${rfId}-${nodeId}-${getHandleId()}-${getType()}`}
      class={cc([
        'solid-flow__handle',
        `solid-flow__handle-${getPosition()}`,
        'nodrag',
        noPanClass,
        local.class,
        {
          source: !isTarget(),
          target: isTarget(),
          connectable: getIsConnectable(),
          connectablestart: getIsConnectableStart(),
          connectableend: getIsConnectableEnd(),
          clickconnecting: connectionState().clickConnecting,
          connectingfrom: connectionState().connectingFrom,
          connectingto: connectionState().connectingTo,
          valid: connectionState().valid,
          /*
           * shows where you can start a connection from
           * and where you can end it while connecting
           */
          connectionindicator:
            getIsConnectable() &&
            (!connectionState().connectionInProcess || connectionState().isPossibleEndHandle) &&
            (connectionState().connectionInProcess || connectionState().clickConnectionInProcess
              ? getIsConnectableEnd()
              : getIsConnectableStart()),
        },
      ])}
      onMouseDown={handlePointerDown}
      onTouchStart={handlePointerDown}
      onClick={connectOnClick ? handleClick : undefined}
      ref={local.ref}
      {...rest}
    >
      {resolved()}
    </div>
  );
};
