import { Component, createMemo, Show } from 'solid-js';
import {
  ConnectionLineType,
  getBezierPath,
  getConnectionStatus,
  getSmoothStepPath,
  getStraightPath,
} from '@xyflow/system';

import type { SolidFlowStore } from '../../store/types';
import cc from 'classcat';

type ConnectionLineProps = {
  store: SolidFlowStore;
  type: ConnectionLineType;
  containerStyle?: string;
  style?: string;
  LineComponent?: Component;
};

export const ConnectionLine: Component<ConnectionLineProps> = (props) => {
  const path = createMemo(() => {
    if (!props.store.connection.inProgress) {
      return '';
    }

    const pathParams = {
      sourceX: props.store.connection.from.x,
      sourceY: props.store.connection.from.y,
      sourcePosition: props.store.connection.fromPosition,
      targetX: props.store.connection.to.x,
      targetY: props.store.connection.to.y,
      targetPosition: props.store.connection.toPosition,
    };

    switch (props.type) {
      case ConnectionLineType.Bezier: {
        const [path] = getBezierPath(pathParams);
        return path;
      }
      case ConnectionLineType.Straight: {
        const [path] = getStraightPath(pathParams);
        return path;
      }
      case ConnectionLineType.Step:
      case ConnectionLineType.SmoothStep: {
        const [path] = getSmoothStepPath({
          ...pathParams,
          borderRadius: props.type === ConnectionLineType.Step ? 0 : undefined,
        });
        return path;
      }
    }
  });

  return (
    <Show when={props.store.connection.inProgress}>
      <svg
        width={props.store.width}
        height={props.store.height}
        class="solid-flow__connectionline"
        style={props.containerStyle || ''}
      >
        <g class={cc(['solid-flow__connection', getConnectionStatus(props.store.connection.isValid)])}>
          <Show
            when={props.LineComponent}
            fallback={<path d={path()} style={props.style || ''} fill="none" class="solid-flow__connection-path" />}
          >
            <props.LineComponent />
          </Show>
        </g>
      </svg>
    </Show>
  );
};

export default ConnectionLine;
