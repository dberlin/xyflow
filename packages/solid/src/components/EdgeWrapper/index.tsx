import { type Component, createEffect, createMemo, createSignal, Show } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import cc from 'classcat';
import {
  elementSelectionKeys,
  errorMessages,
  getEdgePosition,
  getElevatedEdgeZIndex,
  getMarkerId,
} from '@xyflow/system';

import { useStore, useStoreApi } from '../../hooks/useStore';
import { ARIA_EDGE_DESC_KEY } from '../A11yDescriptions';
import { builtinEdgeTypes, nullPosition } from './utils';
import { EdgeUpdateAnchors } from './EdgeUpdateAnchors';
import type { EdgeWrapperProps } from '../../types';

export const EdgeWrapper: Component<EdgeWrapperProps> = (props) => {
  const [updateHover, setUpdateHover] = createSignal<boolean>(false);
  const [reconnecting, setReconnecting] = createSignal<boolean>(false);
  const [edgeRef, setEdgeRef] = createSignal<SVGGElement | undefined>(undefined);
  const storeApi = useStoreApi();

  const edge = useStore((s) => s.edgeLookup.get(props.id)!);
  const defaultEdgeOptions = useStore((s) => s.defaultEdgeOptions);
  const edgeWithDefaults = createMemo(() => (defaultEdgeOptions ? { ...defaultEdgeOptions, ...edge } : edge));

  const [edgeType, setEdgeType] = createSignal('default');

  // Track edgeWithDefaults changes
  createEffect(() => {
    const edgeData = edgeWithDefaults();
    const currentEdgeType = edgeData.type || 'default';
    setEdgeType(currentEdgeType);
  });

  const EdgeComponent = createMemo(() => {
    const currentEdgeType = edgeType();
    let component = props.edgeTypes?.[currentEdgeType] || builtinEdgeTypes[currentEdgeType];

    if (component === undefined) {
      props.onError?.('011', errorMessages['error011'](currentEdgeType));
      setEdgeType('default');
      component = builtinEdgeTypes.default;
    }

    return component;
  });

  const isFocusable = createMemo(
    () =>
      !!(edgeWithDefaults().focusable || (props.edgesFocusable && typeof edgeWithDefaults().focusable === 'undefined'))
  );

  const isReconnectable = createMemo(
    () =>
      typeof props.onReconnect !== 'undefined' &&
      (edgeWithDefaults().reconnectable ||
        (props.edgesReconnectable && typeof edgeWithDefaults().reconnectable === 'undefined'))
  );

  const isSelectable = createMemo(
    () =>
      !!(
        edgeWithDefaults().selectable ||
        (props.elementsSelectable && typeof edgeWithDefaults().selectable === 'undefined')
      )
  );

  const edgePosition = useStore((store) => {
    const sourceNode = store.nodeLookup.get(edgeWithDefaults().source);
    const targetNode = store.nodeLookup.get(edgeWithDefaults().target);

    if (!sourceNode || !targetNode) {
      return {
        zIndex: edgeWithDefaults().zIndex,
        ...nullPosition,
      };
    }

    const edgePosition = getEdgePosition({
      id: props.id,
      sourceNode,
      targetNode,
      sourceHandle: edgeWithDefaults().sourceHandle || null,
      targetHandle: edgeWithDefaults().targetHandle || null,
      connectionMode: store.connectionMode,
      onError: props.onError,
    });

    const zIndex = getElevatedEdgeZIndex({
      selected: edgeWithDefaults().selected,
      zIndex: edgeWithDefaults().zIndex,
      sourceNode,
      targetNode,
      elevateOnSelect: store.elevateEdgesOnSelect,
    });

    return {
      zIndex,
      ...(edgePosition || nullPosition),
    };
  });

  const markerStartUrl = createMemo(() =>
    edgeWithDefaults().markerStart ? `url('#${getMarkerId(edgeWithDefaults().markerStart, props.rfId)}')` : undefined
  );

  const markerEndUrl = createMemo(() =>
    edgeWithDefaults().markerEnd ? `url('#${getMarkerId(edgeWithDefaults().markerEnd, props.rfId)}')` : undefined
  );

  const onEdgeClick = (event: MouseEvent): void => {
    const { addSelectedEdges, unselectNodesAndEdges } = storeApi.getActions();
    const { multiSelectionActive } = storeApi.getState();
    if (isSelectable()) {
      storeApi.setState({ nodesSelectionActive: false });

      if (edgeWithDefaults().selected && multiSelectionActive) {
        unselectNodesAndEdges({ nodes: [], edges: [edgeWithDefaults()] });
        edgeRef()?.blur();
      } else {
        addSelectedEdges([props.id]);
      }
    }

    props.onClick(event, edgeWithDefaults());
  };

  const onEdgeDoubleClick = (event: MouseEvent) => {
    props?.onDoubleClick(event, { ...edgeWithDefaults() });
  };

  const onEdgeContextMenu = (event: MouseEvent) => {
    props?.onContextMenu(event, { ...edgeWithDefaults() });
  };

  const onEdgeMouseEnter = (event: MouseEvent) => {
    props?.onMouseEnter(event, { ...edgeWithDefaults() });
  };

  const onEdgeMouseMove = (event: MouseEvent) => {
    props?.onMouseMove(event, { ...edgeWithDefaults() });
  };

  const onEdgeMouseLeave = (event: MouseEvent) => {
    props?.onMouseLeave(event, { ...edgeWithDefaults() });
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!props.disableKeyboardA11y && elementSelectionKeys.includes(event.key) && isSelectable()) {
      const { unselectNodesAndEdges, addSelectedEdges } = storeApi.getActions();
      const unselect = event.key === 'Escape';

      if (unselect) {
        edgeRef()?.blur();
        unselectNodesAndEdges({ edges: [edgeWithDefaults()] });
      } else {
        addSelectedEdges([props.id]);
      }
    }
  };

  const isVisible = createMemo(() => {
    return !(
      edgeWithDefaults().hidden ||
      edgePosition.sourceX === null ||
      edgePosition.sourceY === null ||
      edgePosition.targetX === null ||
      edgePosition.targetY === null
    );
  });

  return (
    <Show when={isVisible()}>
      <svg style={{ 'z-index': edgePosition.zIndex }}>
        <g
          class={cc([
            'solid-flow__edge',
            `solid-flow__edge-${edgeType()}`,
            edgeWithDefaults().class,
            props.noPanClass,
            {
              selected: edgeWithDefaults().selected,
              animated: edgeWithDefaults().animated,
              inactive: !isSelectable() && !props.onClick,
              updating: updateHover(),
              selectable: isSelectable(),
            },
          ])}
          onClick={onEdgeClick}
          onDblClick={onEdgeDoubleClick}
          onContextMenu={onEdgeContextMenu}
          onMouseEnter={onEdgeMouseEnter}
          onMouseMove={onEdgeMouseMove}
          onMouseLeave={onEdgeMouseLeave}
          onKeyDown={(e) => isFocusable() && handleKeyDown(e)}
          tabIndex={isFocusable() ? 0 : undefined}
          role={isFocusable() ? 'button' : 'img'}
          data-id={props.id}
          data-testid={`rf__edge-${props.id}`}
          aria-label={
            edgeWithDefaults().ariaLabel === null
              ? undefined
              : edgeWithDefaults().ariaLabel || `Edge from ${edgeWithDefaults().source} to ${edgeWithDefaults().target}`
          }
          aria-describedby={isFocusable() ? `${ARIA_EDGE_DESC_KEY}-${props.rfId}` : undefined}
          ref={setEdgeRef}
        >
          <Show when={!reconnecting() && EdgeComponent()}>
            <Dynamic
              component={EdgeComponent()}
              id={props.id}
              source={edgeWithDefaults().source}
              target={edgeWithDefaults().target}
              type={edgeWithDefaults().type}
              selected={edgeWithDefaults().selected}
              animated={edgeWithDefaults().animated}
              selectable={isSelectable()}
              deletable={edgeWithDefaults().deletable ?? true}
              label={edgeWithDefaults().label}
              labelStyle={edgeWithDefaults().labelStyle}
              labelShowBg={edgeWithDefaults().labelShowBg}
              labelBgStyle={edgeWithDefaults().labelBgStyle}
              labelBgPadding={edgeWithDefaults().labelBgPadding}
              labelBgBorderRadius={edgeWithDefaults().labelBgBorderRadius}
              sourceX={edgePosition.sourceX}
              sourceY={edgePosition.sourceY}
              targetX={edgePosition.targetX}
              targetY={edgePosition.targetY}
              sourcePosition={edgePosition.sourcePosition}
              targetPosition={edgePosition.targetPosition}
              data={edgeWithDefaults().data}
              style={edgeWithDefaults().style}
              sourceHandleId={edgeWithDefaults().sourceHandle}
              targetHandleId={edgeWithDefaults().targetHandle}
              markerStart={markerStartUrl()}
              markerEnd={markerEndUrl()}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              pathOptions={'pathOptions' in edgeWithDefaults() ? (edgeWithDefaults() as any).pathOptions : undefined}
              interactionWidth={edgeWithDefaults().interactionWidth}
            />
          </Show>
          <Show when={isReconnectable()}>
            <EdgeUpdateAnchors
              edge={edgeWithDefaults()}
              isReconnectable={isReconnectable() as boolean | 'source' | 'target'}
              reconnectRadius={props.reconnectRadius}
              onReconnect={props.onReconnect}
              onReconnectStart={props.onReconnectStart}
              onReconnectEnd={props.onReconnectEnd}
              sourceX={edgePosition.sourceX}
              sourceY={edgePosition.sourceY}
              targetX={edgePosition.targetX}
              targetY={edgePosition.targetY}
              sourcePosition={edgePosition.sourcePosition}
              targetPosition={edgePosition.targetPosition}
              setUpdateHover={setUpdateHover}
              setReconnecting={setReconnecting}
            />
          </Show>
        </g>
      </svg>
    </Show>
  );
};
