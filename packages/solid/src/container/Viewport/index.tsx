import type { Component, JSX } from 'solid-js';
import { children } from 'solid-js';

import { useStore } from '../../hooks/useStore';
import type { SolidFlowStore } from '../../types';

const selector = (s: SolidFlowStore) => `translate(${s.transform[0]}px,${s.transform[1]}px) scale(${s.transform[2]})`;

type ViewportProps = {
  children: JSX.Element;
};

export const Viewport: Component<ViewportProps> = (props) => {
  const transform = useStore(selector);
  const resolved = children(() => props.children);

  return (
    <div class="solid-flow__viewport xyflow__viewport solid-flow__container" style={{ transform }}>
      {resolved()}
    </div>
  );
};
