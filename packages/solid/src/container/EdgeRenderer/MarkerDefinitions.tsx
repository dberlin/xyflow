import { Component, createMemo, Show, splitProps } from 'solid-js';
import { Dynamic } from 'solid-js/web';
import { createMarkerIds, type MarkerProps } from '@xyflow/system';

import { useStore } from '../../hooks/useStore';
import { useMarkerSymbol } from './MarkerSymbols';

type MarkerDefinitionsProps = {
  defaultColor: string;
  rfId?: string;
};

type MarkerComponentProps = MarkerProps & {
  id: string;
};

const Marker: Component<MarkerComponentProps> = (props) => {
  const [local] = splitProps(props, ['id', 'type', 'color', 'width', 'height', 'markerUnits', 'strokeWidth', 'orient']);
  const SymbolComponent = createMemo(() => useMarkerSymbol(local.type)());

  return (
    <Show when={SymbolComponent()}>
      <marker
        class="solid-flow__arrowhead"
        id={local.id}
        markerWidth={`${local.width || 12.5}`}
        markerHeight={`${local.height || 12.5}`}
        viewBox="-10 -10 20 20"
        markerUnits={(local.markerUnits as 'strokeWidth' | 'userSpaceOnUse') || 'strokeWidth'}
        orient={local.orient || 'auto-start-reverse'}
        refX="0"
        refY="0"
      >
        <Dynamic component={SymbolComponent()} color={local.color} strokeWidth={local.strokeWidth} />
      </marker>
    </Show>
  );
};

/*
 * when you have multiple flows on a page and you hide the first one, the other ones have no markers anymore
 * when they do have markers with the same ids. To prevent this the user can pass a unique id to the solid flow wrapper
 * that we can then use for creating our unique marker ids
 */
const MarkerDefinitions: Component<MarkerDefinitionsProps> = (props) => {
  const [local] = splitProps(props, ['defaultColor', 'rfId']);
  const edges = useStore((s) => s.edges);
  const defaultEdgeOptions = useStore((s) => s.defaultEdgeOptions);

  const markers = createMemo(() => {
    return createMarkerIds(edges, {
      id: local.rfId,
      defaultColor: local.defaultColor,
      defaultMarkerStart: defaultEdgeOptions?.markerStart,
      defaultMarkerEnd: defaultEdgeOptions?.markerEnd,
    });
  });

  return (
    <Show when={markers().length > 0}>
      <svg class="solid-flow__marker">
        <defs>
          {markers().map((marker: MarkerProps) => (
            <Marker
              id={marker.id}
              type={marker.type}
              color={marker.color}
              width={marker.width}
              height={marker.height}
              markerUnits={marker.markerUnits}
              strokeWidth={marker.strokeWidth}
              orient={marker.orient}
            />
          ))}
        </defs>
      </svg>
    </Show>
  );
};

export default MarkerDefinitions;
