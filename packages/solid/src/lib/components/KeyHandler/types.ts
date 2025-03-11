import type { SolidFlowStore } from '../../store/types';
import type { KeyDefinition } from '../../types';

export type KeyHandlerProps = {
  store: SolidFlowStore;
  selectionKey?: KeyDefinition | KeyDefinition[] | null;
  multiSelectionKey?: KeyDefinition | KeyDefinition[] | null;
  deleteKey?: KeyDefinition | KeyDefinition[] | null;
  panActivationKey?: KeyDefinition | KeyDefinition[] | null;
  zoomActivationKey?: KeyDefinition | KeyDefinition[] | null;
};
