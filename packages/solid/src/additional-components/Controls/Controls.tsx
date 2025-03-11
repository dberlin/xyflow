import { Component, splitProps, children } from 'solid-js';
import cc from 'classcat';

import { useStore, useStoreApi } from '../../hooks/useStore';
import { useSolidFlow } from '../../hooks/useSolidFlow';
import { Panel } from '../../components/Panel';
import { SolidFlowStore } from '../../types';

import { PlusIcon } from './Icons/Plus';
import { MinusIcon } from './Icons/Minus';
import { FitViewIcon } from './Icons/FitView';
import { LockIcon } from './Icons/Lock';
import { UnlockIcon } from './Icons/Unlock';
import { ControlButton } from './ControlButton';
import type { ControlProps } from './types';

const selector = (s: SolidFlowStore) => ({
  isInteractive: s.nodesDraggable || s.nodesConnectable || s.elementsSelectable,
  minZoomReached: s.transform[2] <= s.minZoom,
  maxZoomReached: s.transform[2] >= s.maxZoom,
});

export const Controls: Component<ControlProps> = (props) => {
  const [local, others] = splitProps(props, [
    'style',
    'showZoom',
    'showFitView',
    'showInteractive',
    'fitViewOptions',
    'onZoomIn',
    'onZoomOut',
    'onFitView',
    'onInteractiveChange',
    'class',
    'children',
    'position',
    'orientation',
    'aria-label',
  ]);

  const resolved = children(() => local.children);
  const store = useStoreApi();
  const { isInteractive, minZoomReached, maxZoomReached } = useStore(selector);
  const { zoomIn, zoomOut, fitView } = useSolidFlow();

  const onZoomInHandler = async () => {
    await zoomIn();
    local.onZoomIn?.();
  };

  const onZoomOutHandler = async () => {
    await zoomOut();
    local.onZoomOut?.();
  };

  const onFitViewHandler = async () => {
    await fitView(local.fitViewOptions);
    local.onFitView?.();
  };

  const onToggleInteractivity = () => {
    store.setState({
      nodesDraggable: !isInteractive,
      nodesConnectable: !isInteractive,
      elementsSelectable: !isInteractive,
    });

    local.onInteractiveChange?.(!isInteractive);
  };

  return (
    <Panel
      class={cc(['solid-flow__controls', local.orientation === 'horizontal' ? 'horizontal' : 'vertical', local.class])}
      position={local.position ?? 'bottom-left'}
      style={local.style}
      data-testid="rf__controls"
      aria-label={local['aria-label'] ?? 'Solid Flow controls'}
      {...others}
    >
      {local.showZoom !== false && (
        <>
          <ControlButton
            onClick={onZoomInHandler}
            class="solid-flow__controls-zoomin"
            title="zoom in"
            aria-label="zoom in"
            disabled={maxZoomReached}
          >
            <PlusIcon />
          </ControlButton>
          <ControlButton
            onClick={onZoomOutHandler}
            class="solid-flow__controls-zoomout"
            title="zoom out"
            aria-label="zoom out"
            disabled={minZoomReached}
          >
            <MinusIcon />
          </ControlButton>
        </>
      )}
      {local.showFitView !== false && (
        <ControlButton
          class="solid-flow__controls-fitview"
          onClick={onFitViewHandler}
          title="fit view"
          aria-label="fit view"
        >
          <FitViewIcon />
        </ControlButton>
      )}
      {local.showInteractive !== false && (
        <ControlButton
          class="solid-flow__controls-interactive"
          onClick={onToggleInteractivity}
          title="toggle interactivity"
          aria-label="toggle interactivity"
        >
          {isInteractive ? <UnlockIcon /> : <LockIcon />}
        </ControlButton>
      )}
      {resolved()}
    </Panel>
  );
};

/**
 * The `<Controls />` component renders a small panel that contains convenient
 * buttons to zoom in, zoom out, fit the view, and lock the viewport.
 *
 * @public
 * @example
 *```tsx
 *import { SolidFlow, Controls } from '@xyflow/solid'
 *
 *export default function Flow() {
 *  return (
 *    <SolidFlow nodes={[...]} edges={[...]}>
 *      <Controls />
 *    </SolidFlow>
 *  )
 *}
 *```
 *
 * @remarks To extend or customise the controls, you can use the [`<ControlButton />`](/api-reference/components/control-button) component
 *
 */
export default Controls;
