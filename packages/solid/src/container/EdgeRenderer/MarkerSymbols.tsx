import { Component, createMemo, splitProps } from 'solid-js';
import { type EdgeMarker, errorMessages, MarkerType } from '@xyflow/system';

import { useStoreApi } from '../../hooks/useStore';

type SymbolProps = Omit<EdgeMarker, 'type'>;

const ArrowSymbol: Component<SymbolProps> = (props) => {
  const [local, rest] = splitProps(props, ['color', 'strokeWidth']);
  const color = () => local.color || 'none';
  const strokeWidth = () => local.strokeWidth || 1;

  return (
    <polyline
      style={{
        stroke: color(),
        'stroke-width': `${strokeWidth()}px`,
      }}
      stroke-linecap="round"
      stroke-linejoin="round"
      fill="none"
      points="-5,-4 0,0 -5,4"
      {...rest}
    />
  );
};

const ArrowClosedSymbol: Component<SymbolProps> = (props) => {
  const [local, rest] = splitProps(props, ['color', 'strokeWidth']);
  const color = () => local.color || 'none';
  const strokeWidth = () => local.strokeWidth || 1;

  return (
    <polyline
      style={{
        stroke: color(),
        fill: color(),
        'stroke-width': `${strokeWidth()}px`,
      }}
      stroke-linecap="round"
      stroke-linejoin="round"
      points="-5,-4 0,0 -5,4 -5,-4"
      {...rest}
    />
  );
};

export const MarkerSymbols = {
  [MarkerType.Arrow]: ArrowSymbol,
  [MarkerType.ArrowClosed]: ArrowClosedSymbol,
};

export function useMarkerSymbol(type: MarkerType) {
  const store = useStoreApi();

  const symbol = createMemo(() => {
    const symbolExists = Object.prototype.hasOwnProperty.call(MarkerSymbols, type);

    if (!symbolExists) {
      store.getState().onError?.('009', errorMessages['error009'](type));

      return null;
    }

    return MarkerSymbols[type];
  });

  return symbol;
}
