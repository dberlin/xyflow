import cc from 'classcat';
import { useStore } from '../../hooks/useStore';
import { DotPattern, LinePattern } from './Patterns';
import { containerStyle } from '../../styles/utils';
import { type BackgroundProps, BackgroundVariant } from './types';
import { JSX } from 'solid-js/jsx-runtime';
import { createMemo, createSignal } from 'solid-js';

const defaultSize = {
  [BackgroundVariant.Dots]: 1,
  [BackgroundVariant.Lines]: 1,
  [BackgroundVariant.Cross]: 6,
};

const selector = (s) => ({ transform: s.transform, patternId: `pattern-${s.rfId}` });

export const BackgroundComponent = (props: BackgroundProps) => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [svgRef, setSvgRef] = createSignal<SVGSVGElement | undefined>(undefined);
  const { transform, patternId } = useStore(selector);

  const patternSize = createMemo(() => props.size || defaultSize[props.variant]);
  const isDots = createMemo(() => props.variant === BackgroundVariant.Dots);
  const isCross = createMemo(() => props.variant === BackgroundVariant.Cross);

  const gapXY = createMemo<[number, number]>(() =>
    Array.isArray(props.gap) ? props.gap : [props.gap ?? 20, props.gap ?? 20]
  );

  const scaledGap = createMemo<[number, number]>(() => [
    gapXY()[0] * transform[2] || 1,
    gapXY()[1] * transform[2] || 1,
  ]);

  const scaledSize = createMemo(() => patternSize() * transform[2]);

  const offsetXY = createMemo<[number, number]>(() =>
    Array.isArray(props.offset) ? props.offset : [props.offset ?? 0, props.offset ?? 0]
  );

  const patternDimensions = createMemo<[number, number]>(() =>
    isCross() ? [scaledSize(), scaledSize()] : scaledGap()
  );

  const scaledOffset = createMemo<[number, number]>(() => [
    offsetXY()[0] * transform[2] || 1 + patternDimensions()[0] / 2,
    offsetXY()[1] * transform[2] || 1 + patternDimensions()[1] / 2,
  ]);

  const _patternId = createMemo(() => `${patternId}${props.id ? props.id : ''}`);

  return (
    <svg
      class={cc(['solid-flow__background', props.class])}
      style={
        {
          ...props.style,
          ...containerStyle,
          '--xy-background-color-props': props.bgColor,
          '--xy-background-pattern-color-props': props.color,
        } as JSX.CSSProperties
      }
      ref={setSvgRef}
      data-testid="rf__background"
    >
      <pattern
        id={_patternId()}
        x={transform[0] % scaledGap()[0]}
        y={transform[1] % scaledGap()[1]}
        width={scaledGap()[0]}
        height={scaledGap()[1]}
        patternUnits="userSpaceOnUse"
        patternTransform={`translate(-${scaledOffset()[0]},-${scaledOffset()[1]})`}
      >
        {isDots() ? (
          <DotPattern radius={scaledSize() / 2} class={props.patternClass} />
        ) : (
          <LinePattern
            dimensions={patternDimensions()}
            lineWidth={props.lineWidth ?? 1}
            variant={props.variant}
            class={props.patternClass}
          />
        )}
      </pattern>
      <rect x="0" y="0" width="100%" height="100%" fill={`url(#${_patternId()})`} />
    </svg>
  );
};

BackgroundComponent.displayName = 'Background';

/**
 * The `<Background />` component makes it convenient to render different types of backgrounds common in node-based UIs. It comes with three variants: lines, dots and cross.
 *
 * @example
 *
 * A simple example of how to use the Background component.
 *
 * ```tsx
 * import { useState } from 'react';
 * import { SolidFlow, Background, BackgroundVariant } from '@xyflow/solid';
 *
 * export default function Flow() {
 *   return (
 *     <SolidFlow defaultNodes={[...]} defaultEdges={[...]}>
 *       <Background color="#ccc" variant={BackgroundVariant.Dots} />
 *     </SolidFlow>
 *   );
 * }
 * ```
 *
 * @example
 *
 * In this example you can see how to combine multiple backgrounds
 *
 * ```tsx
 * import { SolidFlow, Background, BackgroundVariant } from '@xyflow/solid';
 * import '@xyflow/solid/dist/style.css';
 *
 * export default function Flow() {
 *   return (
 *     <SolidFlow defaultNodes={[...]} defaultEdges={[...]}>
 *       <Background
 *         id="1"
 *         gap={10}
 *         color="#f1f1f1"
 *         variant={BackgroundVariant.Lines}
 *       />
 *       <Background
 *         id="2"
 *         gap={100}
 *         color="#ccc"
 *         variant={BackgroundVariant.Lines}
 *       />
 *     </SolidFlow>
 *   );
 * }
 * ```
 *
 * @remarks
 *
 * When combining multiple <Background /> components it's important to give each of them a unique id prop!
 *
 */
export const Background = BackgroundComponent;
