import { Component, createMemo, mergeProps, Show } from 'solid-js';
import { getMarkerId } from '@xyflow/system';

import { BezierEdgeInternal } from '../edges/BezierEdgeInternal';

import type { EdgeEvents, EdgeLayouted } from '../../types';
import type { SolidFlowStore } from '../../store/types';
import { EdgeIdContext } from '../../types/contexts';
import cc from 'classcat';

interface EdgeWrapperProps extends EdgeEvents {
  edge: EdgeLayouted;
  store: SolidFlowStore;
}

export const EdgeWrapper: Component<EdgeWrapperProps> = (props) => {
  // FIXME: Use mergeprops instead.
  const edgeProps = createMemo(() => {
    const firstMerge = mergeProps(
      {
        animated: false,
        selected: false,
        data: {},
        selectable: props.store.elementsSelectable,
        deletable: true,
        type: 'default',
      },
      props.store.defaultEdgeOptions
    );
    const finalMerge = mergeProps(firstMerge, props.edge);
    return finalMerge;
  });

  const EdgeComponent = createMemo(() => {
    return props.store.edgeTypes[edgeProps().type] ?? BezierEdgeInternal;
  });

  const markerStartUrl = createMemo(() => {
    return edgeProps().markerStart ? `url('#${getMarkerId(edgeProps().markerStart, props.store.flowId)}')` : undefined;
  });

  const markerEndUrl = createMemo(() => {
    return edgeProps().markerEnd ? `url('#${getMarkerId(edgeProps().markerEnd, props.store.flowId)}')` : undefined;
  });

  // Event handlers
  const handleClick = (event: MouseEvent) => {
    const edge = props.store.edgeLookup.get(props.edge.id);

    if (edge) {
      if (edgeProps().selectable) props.store.handleEdgeSelection(props.edge.id);
      props.onedgeclick?.({ event, edge });
    }
  };

  const handleContextMenu = (event: MouseEvent) => {
    if (!props.onedgecontextmenu) return;

    const edge = props.store.edgeLookup.get(props.edge.id);
    if (edge) {
      props.onedgecontextmenu({ event, edge });
    }
  };

  const handlePointerEnter = (event: PointerEvent) => {
    if (!props.onedgepointerenter) return;

    const edge = props.store.edgeLookup.get(props.edge.id);
    if (edge) {
      props.onedgepointerenter({ event, edge });
    }
  };

  const handlePointerLeave = (event: PointerEvent) => {
    if (!props.onedgepointerleave) return;

    const edge = props.store.edgeLookup.get(props.edge.id);
    if (edge) {
      props.onedgepointerleave({ event, edge });
    }
  };

  return (
    // eslint-disable-next-line solid/reactivity
    <EdgeIdContext.Provider value={props.edge.id}>
      <Show when={!edgeProps().hidden}>
        <svg style={{ 'z-index': edgeProps().zIndex }}>
          <g
            class={cc(['solid-flow__edge', edgeProps().class, edgeProps])}
            classList={{
              animated: !!edgeProps().animated,
              selected: !!edgeProps().selected,
              selectable: !!edgeProps().selectable,
            }}
            data-id={props.edge.id}
            onClick={handleClick}
            onContextMenu={handleContextMenu}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            aria-label={
              edgeProps().ariaLabel === null
                ? undefined
                : edgeProps().ariaLabel
                  ? edgeProps().ariaLabel
                  : `Edge from ${edgeProps().source} to ${edgeProps().target}`
            }
            role="img"
          >
            {/* Use the component returned by EdgeComponent() memo */}
            {(() => {
              const Component = EdgeComponent();
              return (
                <Component
                  id={props.edge.id}
                  source={edgeProps().source}
                  target={edgeProps().target}
                  sourceX={edgeProps().sourceX}
                  sourceY={edgeProps().sourceY}
                  targetX={edgeProps().targetX}
                  targetY={edgeProps().targetY}
                  sourcePosition={edgeProps().sourcePosition}
                  targetPosition={edgeProps().targetPosition}
                  animated={edgeProps().animated}
                  selected={edgeProps().selected}
                  label={edgeProps().label}
                  labelStyle={edgeProps().labelStyle}
                  data={edgeProps().data}
                  style={edgeProps().style}
                  interactionWidth={edgeProps().interactionWidth}
                  selectable={edgeProps().selectable}
                  deletable={edgeProps().deletable}
                  type={edgeProps().type}
                  sourceHandleId={edgeProps().sourceHandle}
                  targetHandleId={edgeProps().targetHandle}
                  markerStart={markerStartUrl()}
                  markerEnd={markerEndUrl()}
                />
              );
            })()}
          </g>
        </svg>
      </Show>
    </EdgeIdContext.Provider>
  );
};

export default EdgeWrapper;
