import type { SolidFlowStore } from '../../store/types';
import type { OnMove, OnMoveEnd, OnMoveStart, PanOnScrollMode } from '@xyflow/system';
import type { JSX } from 'solid-js';

export type ZoomProps = {
  store: SolidFlowStore;
  panOnScrollMode: PanOnScrollMode;
  onMove?: OnMove;
  onMoveStart?: OnMoveStart;
  onMoveEnd?: OnMoveEnd;
  preventScrolling: boolean;
  zoomOnScroll: boolean;
  zoomOnDoubleClick: boolean;
  zoomOnPinch: boolean;
  panOnScroll: boolean;
  panOnDrag: boolean | number[];
  paneClickDistance: number;
  children: JSX.Element;
};
