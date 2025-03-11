import type { SolidFlowStore } from '../store/types';

import { useContext } from 'solid-js';
import { FlowStoreContext } from '../types/contexts';

export function useStore(): SolidFlowStore {
  const storeContext = useContext(FlowStoreContext);

  if (!storeContext) {
    throw new Error('In order to use useStore you need to wrap your component in a <SolidFlowProvider />');
  }

  return storeContext.getStore();
}
