// Reconnectable edges have a anchors around their handles to reconnect the edge.
import {
  type Connection,
  type EdgePosition,
  type FinalConnectionState,
  type HandleType,
  XYHandle,
} from '@xyflow/system';
import type { Component } from 'solid-js';

import { EdgeAnchor } from '../Edges/EdgeAnchor';
import type { Edge, EdgeWrapperProps } from '../../types/edges';
import { useStoreApi } from '../../hooks/useStore';

type EdgeUpdateAnchorsProps<EdgeType extends Edge = Edge> = {
  edge: EdgeType;
  isReconnectable: boolean | 'source' | 'target';
  reconnectRadius: EdgeWrapperProps['reconnectRadius'];
  onReconnect: EdgeWrapperProps<EdgeType>['onReconnect'];
  onReconnectStart: EdgeWrapperProps<EdgeType>['onReconnectStart'];
  onReconnectEnd: EdgeWrapperProps<EdgeType>['onReconnectEnd'];
  setUpdateHover: (hover: boolean) => void;
  setReconnecting: (updating: boolean) => void;
} & EdgePosition;

export const EdgeUpdateAnchors: Component<EdgeUpdateAnchorsProps> = (props) => {
  const store = useStoreApi();
  const handleEdgeUpdater = (
    event: MouseEvent,
    oppositeHandle: { nodeId: string; id: string | null; type: HandleType }
  ) => {
    // avoid triggering edge updater if mouse btn is not left
    if (event.button !== 0) {
      return;
    }

    const {
      autoPanOnConnect,
      domNode,
      isValidConnection,
      connectionMode,
      connectionRadius,
      lib,
      onConnectStart,
      onConnectEnd,
      nodeLookup,
      rfId: flowId,
    } = store.getState();
    const { updateConnection, cancelConnection, panBy } = store.getActions();
    const isTarget = oppositeHandle.type === 'target';

    props.setReconnecting(true);
    props.onReconnectStart?.(event, props.edge, oppositeHandle.type);

    const _onReconnectEnd = (evt: MouseEvent | TouchEvent, connectionState: FinalConnectionState) => {
      props.setReconnecting(false);
      props.onReconnectEnd?.(evt, props.edge, oppositeHandle.type, connectionState);
    };

    const onConnectEdge = (connection: Connection) => props.onReconnect?.(props.edge, connection);

    XYHandle.onPointerDown(event, {
      autoPanOnConnect,
      connectionMode,
      connectionRadius,
      domNode,
      handleId: oppositeHandle.id,
      nodeId: oppositeHandle.nodeId,
      nodeLookup,
      isTarget,
      edgeUpdaterType: oppositeHandle.type,
      lib,
      flowId,
      cancelConnection,
      panBy,
      isValidConnection,
      onConnect: onConnectEdge,
      onConnectStart,
      onConnectEnd,
      onReconnectEnd: _onReconnectEnd,
      updateConnection,
      getTransform: () => store.getState().transform,
      getFromHandle: () => store.getState().connection.fromHandle,
    });
  };

  const onReconnectSourceMouseDown = (event: MouseEvent): void =>
    handleEdgeUpdater(event, { nodeId: props.edge.target, id: props.edge.targetHandle ?? null, type: 'target' });

  const onReconnectTargetMouseDown = (event: MouseEvent): void =>
    handleEdgeUpdater(event, { nodeId: props.edge.source, id: props.edge.sourceHandle ?? null, type: 'source' });

  const onReconnectMouseEnter = () => props.setUpdateHover(true);
  const onReconnectMouseOut = () => props.setUpdateHover(false);

  return (
    <>
      {(props.isReconnectable === true || props.isReconnectable === 'source') && (
        <EdgeAnchor
          position={props.sourcePosition}
          centerX={props.sourceX}
          centerY={props.sourceY}
          radius={props.reconnectRadius}
          onMouseDown={onReconnectSourceMouseDown}
          onMouseEnter={onReconnectMouseEnter}
          onMouseOut={onReconnectMouseOut}
          type="source"
        />
      )}
      {(props.isReconnectable === true || props.isReconnectable === 'target') && (
        <EdgeAnchor
          position={props.targetPosition}
          centerX={props.targetX}
          centerY={props.targetY}
          radius={props.reconnectRadius}
          onMouseDown={onReconnectTargetMouseDown}
          onMouseEnter={onReconnectMouseEnter}
          onMouseOut={onReconnectMouseOut}
          type="target"
        />
      )}
    </>
  );
};
