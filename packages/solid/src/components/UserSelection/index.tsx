import { Show } from 'solid-js';

import { useStore } from '../../hooks/useStore';
import type { SolidFlowStore } from '../../types';

const selector = (s: SolidFlowStore) => ({
  userSelectionActive: s.userSelectionActive,
  userSelectionRect: s.userSelectionRect,
});

export function UserSelection() {
  const { userSelectionActive, userSelectionRect } = useStore(selector);
  const isActive = () => userSelectionActive && userSelectionRect;

  return (
    <Show when={isActive()}>
      <div
        class="solid-flow__selection solid-flow__container"
        style={{
          width: `${userSelectionRect?.width}`,
          height: `${userSelectionRect?.height}`,
          transform: `translate(${userSelectionRect?.x}px, ${userSelectionRect?.y}px)`,
        }}
      />
    </Show>
  );
}
