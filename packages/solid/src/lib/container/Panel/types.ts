import type { PanelPosition } from '@xyflow/system';
import type { JSX } from 'solid-js';

export type PanelProps = JSX.HTMLAttributes<HTMLDivElement> & {
  'data-testid'?: string;
  'data-message'?: string;
  /** Set position of the panel
   * @example 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right'
   */
  position?: PanelPosition;
  style?: string;
  class?: string;
  children?: JSX.Element;
};
