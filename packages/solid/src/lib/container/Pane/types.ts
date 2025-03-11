import type { PaneEvents } from '../../types';
import type { SolidFlowStore } from '../../store/types';
import type { JSX } from 'solid-js';

export type PaneProps = {
  store: SolidFlowStore;
  panOnDrag?: boolean | number[];
  selectionOnDrag?: boolean;
  children: JSX.Element;
} & PaneEvents;
