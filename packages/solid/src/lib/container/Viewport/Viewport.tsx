import { Component, JSX } from 'solid-js';
import type { SolidFlowStore } from '../../store/types';
import './Viewport.css';

interface ViewportProps {
  store: SolidFlowStore;
  children: JSX.Element;
}

export const Viewport: Component<ViewportProps> = (props: ViewportProps) => {
  return (
    <div
      class="solid-flow__viewport xyflow__viewport"
      style={{
        transform: `translate(${props.store.viewport.x}px, ${props.store.viewport.y}px) scale(${props.store.viewport.zoom})`,
      }}
    >
      {props.children}
    </div>
  );
};

// CSS should be moved to a separate .css file or imported as a CSS module
