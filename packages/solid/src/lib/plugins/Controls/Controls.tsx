import { Component, createSignal, mergeProps, splitProps } from 'solid-js';
import { useStore } from '../../hooks/useStore';
import { Panel } from '../../container/Panel';
import { ControlButton } from './ControlButton';
import { PlusIcon } from './Icons/Plus';
import { MinusIcon } from './Icons/Minus';
import { FitViewIcon } from './Icons/Fit';
import { LockIcon } from './Icons/Lock';
import { UnlockIcon } from './Icons/Unlock';
import cc from 'classcat';
import type { ControlsProps } from './types';

export const Controls: Component<ControlsProps> = (props: ControlsProps) => {
  const store = useStore();

  const [local, buttonProps] = splitProps(
    props,
    [
      'position',
      'orientation',
      'showZoom',
      'showFitView',
      'showLock',
      'style',
      'class',
      'aria-label',
      'fitViewOptions',
      'children',
      'before',
      'after',
    ],
    ['buttonBgColor', 'buttonBgColorHover', 'buttonColor', 'buttonColorHover', 'buttonBorderColor']
  );

  const mergedProps = mergeProps(
    {
      position: 'bottom-left',
      orientation: 'vertical',
      showZoom: true,
      showFitView: true,
      showLock: true,
      'aria-label': 'Svelte Flow controls',
      class: '',
    },
    local
  );

  const orientationClass = () => (mergedProps.orientation === 'horizontal' ? 'horizontal' : 'vertical');

  const [isInteractive, setIsInteractive] = createSignal(
    store.nodesDraggable || store.nodesConnectable || store.elementsSelectable
  );

  const minZoomReached = () => store.viewport.zoom <= store.minZoom;
  const maxZoomReached = () => store.viewport.zoom >= store.maxZoom;

  const onZoomInHandler = () => {
    store.zoomIn();
  };

  const onZoomOutHandler = () => {
    store.zoomOut();
  };

  const onFitViewHandler = () => {
    store.fitView(mergedProps.fitViewOptions);
  };

  const onToggleInteractivity = () => {
    const newValue = !isInteractive();
    setIsInteractive(newValue);

    store.nodesDraggable = newValue;
    store.nodesConnectable = newValue;
    store.elementsSelectable = newValue;
  };
  return (
    <Panel
      class={cc(['solid-flow__controls', orientationClass(), mergedProps.class])}
      position={mergedProps.position}
      data-testid="solid-flow__controls"
      aria-label={mergedProps['aria-label']}
      style={mergedProps.style}
    >
      {mergedProps.before}

      {mergedProps.showZoom && (
        <>
          <ControlButton
            onclick={onZoomInHandler}
            class="solid-flow__controls-zoomin"
            title="zoom in"
            aria-label="zoom in"
            disabled={maxZoomReached()}
            {...buttonProps}
          >
            <PlusIcon />
          </ControlButton>
          <ControlButton
            onclick={onZoomOutHandler}
            class="solid-flow__controls-zoomout"
            title="zoom out"
            aria-label="zoom out"
            disabled={minZoomReached()}
            {...buttonProps}
          >
            <MinusIcon />
          </ControlButton>
        </>
      )}

      {mergedProps.showFitView && (
        <ControlButton
          class="solid-flow__controls-fitview"
          onclick={onFitViewHandler}
          title="fit view"
          aria-label="fit view"
          {...buttonProps}
        >
          <FitViewIcon />
        </ControlButton>
      )}

      {mergedProps.showLock && (
        <ControlButton
          class="solid-flow__controls-interactive"
          onclick={onToggleInteractivity}
          title="toggle interactivity"
          aria-label="toggle interactivity"
          {...buttonProps}
        >
          {isInteractive() ? <UnlockIcon /> : <LockIcon />}
        </ControlButton>
      )}

      {props.children}
      {mergedProps.after}
    </Panel>
  );
};

export default Controls;
