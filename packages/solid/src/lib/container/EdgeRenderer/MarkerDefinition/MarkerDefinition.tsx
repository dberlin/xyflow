import { Component, For } from 'solid-js';
import { useStore } from '../../../store';
import { Marker } from '.';

export const MarkerDefinition: Component = () => {
  const store = useStore();

  return (
    <defs>
      <For each={store.markers}>
        {(marker) => {
          // Ensure markerUnits is properly typed
          const safeMarkerUnits =
            marker.markerUnits === 'strokeWidth' || marker.markerUnits === 'userSpaceOnUse'
              ? marker.markerUnits
              : undefined; // Will use default from Marker component

          return (
            <Marker
              id={marker.id}
              type={marker.type}
              color={marker.color}
              width={marker.width}
              height={marker.height}
              markerUnits={safeMarkerUnits}
              orient={marker.orient}
              strokeWidth={marker.strokeWidth}
            />
          );
        }}
      </For>
    </defs>
  );
};

export default MarkerDefinition;
