import { useStore } from '../../store';
import { type BackgroundProps, BackgroundVariant } from './types';
import './Background.css';
import DotPattern from './DotPattern';
import LinePattern from './LinePattern';
import { Component, createMemo, Match, mergeProps, Switch } from 'solid-js';
import { filterUndefinedStyles } from '../../utils';
import cc from 'classcat';

const defaultSize = {
  [BackgroundVariant.Dots]: 1,
  [BackgroundVariant.Lines]: 1,
  [BackgroundVariant.Cross]: 6,
};

export const Background: Component<BackgroundProps> = (props) => {
  const mergedProps = mergeProps(
    {
      variant: BackgroundVariant.Dots,
      gap: 20,
      size: 1,
      lineWidth: 1,
    },
    props
  );

  const store = useStore();

  const patternSize = () => mergedProps.size ?? defaultSize[mergedProps.variant!];
  const isDots = () => mergedProps.variant === BackgroundVariant.Dots;
  const isLines = () => mergedProps.variant === BackgroundVariant.Lines;
  const isCross = () => mergedProps.variant === BackgroundVariant.Cross;
  const gapXY = () => (Array.isArray(mergedProps.gap!) ? mergedProps.gap! : [mergedProps.gap!, mergedProps.gap!]);

  const patternId = createMemo(() => `background-pattern-${store.flowId}-${mergedProps.id ?? ''}`);
  const scaledGap = createMemo(() => [gapXY()[0] * store.viewport.zoom || 1, gapXY()[1] * store.viewport.zoom || 1]);
  const scaledSize = createMemo(() => patternSize() * store.viewport.zoom);
  const patternDimensions = createMemo(() => (isCross ? [scaledSize(), scaledSize()] : scaledGap) as [number, number]);
  const patternOffset = createMemo(() =>
    isDots ? [scaledSize() / 2, scaledSize() / 2] : [patternDimensions()[0] / 2, patternDimensions()[1] / 2]
  );
  return (
    <svg
      class={cc(['solid-flow__background', mergedProps.class])}
      data-testid="solid-flow__background"
      style={filterUndefinedStyles([
        ['--xy-background-color-props', mergedProps.bgColor],
        ['--xy-background-pattern-color-props', mergedProps.patternColor],
      ])}
    >
      <pattern
        id={patternId()}
        x={store.viewport.x % scaledGap()[0]}
        y={store.viewport.y % scaledGap()[1]}
        width={scaledGap()[0]}
        height={scaledGap()[1]}
        patternUnits="userSpaceOnUse"
        patternTransform={`translate(-${patternOffset()[0]},-${patternOffset()[1]})`}
      >
        <Switch>
          <Match when={isDots}>
            <DotPattern radius={scaledSize() / 2} class={mergedProps.patternClass} />
          </Match>

          <Match when={isLines}>
            <LinePattern
              dimensions={patternDimensions()}
              variant={mergedProps.variant}
              lineWidth={mergedProps.lineWidth}
              class={mergedProps.patternClass}
            />
          </Match>
        </Switch>
      </pattern>
      <rect x="0" y="0" width="100%" height="100%" fill={`url(#${patternId()})`} />
    </svg>
  );
};
