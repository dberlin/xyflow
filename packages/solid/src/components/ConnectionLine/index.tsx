import { type Component, createMemo, type JSX, Show, splitProps } from 'solid-js';
import cc from 'classcat';
import {
  ConnectionLineType,
  getBezierPath,
  getConnectionStatus,
  getSmoothStepPath,
  getStraightPath,
} from '@xyflow/system';

import { useStore } from '../../hooks/useStore';
import { getSimpleBezierPath } from '../Edges/SimpleBezierEdge';
import type { ConnectionLineComponent, Node, SolidFlowStore } from '../../types';
import { useConnection } from '../../hooks/useConnection';

type ConnectionLineWrapperProps<NodeType extends Node = Node> = {
  type: ConnectionLineType;
  component?: ConnectionLineComponent<NodeType>;
  containerStyle?: JSX.CSSProperties;
  style?: JSX.CSSProperties;
};

const selector = (s: SolidFlowStore) => ({
  nodesConnectable: s.nodesConnectable,
  isValid: s.connection.isValid,
  inProgress: s.connection.inProgress,
  width: s.width,
  height: s.height,
});

export const ConnectionLineWrapper: Component<ConnectionLineWrapperProps> = (props) => {
  const [local] = splitProps(props, ['containerStyle', 'style', 'type', 'component']);
  const { nodesConnectable, width, height, isValid, inProgress } = useStore(selector);
  const renderConnection = !!(width && nodesConnectable && inProgress);

  return (
    <Show when={renderConnection}>
      <svg
        style={local.containerStyle}
        width={width}
        height={height}
        class="solid-flow__connectionline solid-flow__container"
      >
        <g class={cc(['solid-flow__connection', getConnectionStatus(isValid)])}>
          <ConnectionLine style={local.style} type={local.type} CustomComponent={local.component} isValid={isValid} />
        </g>
      </svg>
    </Show>
  );
};

type ConnectionLineProps<NodeType extends Node = Node> = {
  type: ConnectionLineType;
  style?: JSX.CSSProperties;
  CustomComponent?: ConnectionLineComponent<NodeType>;
  isValid: boolean | null;
};
const ConnectionLine: Component<ConnectionLineProps> = <NodeType extends Node = Node>(props) => {
  const [local] = splitProps(props, ['style', 'type', 'CustomComponent', 'isValid']);
  const { inProgress, from, fromNode, fromHandle, fromPosition, to, toNode, toHandle, toPosition } =
    useConnection<NodeType>();

  const getPath = createMemo(() => {
    const pathParams = {
      sourceX: from.x,
      sourceY: from.y,
      sourcePosition: fromPosition,
      targetX: to.x,
      targetY: to.y,
      targetPosition: toPosition,
    };

    let path = '';

    switch (local.type) {
      case ConnectionLineType.Bezier:
        [path] = getBezierPath(pathParams);
        break;
      case ConnectionLineType.SimpleBezier:
        [path] = getSimpleBezierPath(pathParams);
        break;
      case ConnectionLineType.Step:
        [path] = getSmoothStepPath({
          ...pathParams,
          borderRadius: 0,
        });
        break;
      case ConnectionLineType.SmoothStep:
        [path] = getSmoothStepPath(pathParams);
        break;
      default:
        [path] = getStraightPath(pathParams);
    }

    return path;
  });

  return (
    <Show when={inProgress}>
      <Show
        when={local.CustomComponent}
        fallback={<path d={getPath()} fill="none" class="solid-flow__connection-path" style={local.style} />}
      >
        <local.CustomComponent
          connectionLineType={local.type}
          connectionLineStyle={local.style}
          fromNode={fromNode}
          fromHandle={fromHandle}
          fromX={from.x}
          fromY={from.y}
          toX={to.x}
          toY={to.y}
          fromPosition={fromPosition}
          toPosition={toPosition}
          connectionStatus={getConnectionStatus(local.isValid)}
          toNode={toNode}
          toHandle={toHandle}
        />
      </Show>
    </Show>
  );
};
