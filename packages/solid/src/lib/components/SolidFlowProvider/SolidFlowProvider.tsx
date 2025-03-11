import { Component, createContext, createSignal, onCleanup } from 'solid-js';

import { createStore } from '../../store';
import type { SolidFlowProviderProps } from './types';
import type { ProviderContext, SolidFlowStore } from '../../store/types';

// Create the provider context
const SolidFlowProviderContext = createContext<ProviderContext>({
  provider: true,
  getStore: () => {
    throw new Error('SolidFlowProvider context not initialized');
  },
  setStore: () => {
    throw new Error('SolidFlowProvider context not initialized');
  },
});

export const SolidFlowProvider: Component<SolidFlowProviderProps> = (props) => {
  const [store, setStore] = createSignal(createStore({ props: {}, nodes: [], edges: [] }));
  const providerContext: ProviderContext = {
    provider: true,
    getStore: () => store(),
    setStore: (newStore: SolidFlowStore) => {
      setStore(newStore);
    },
  };

  onCleanup(() => {
    store().reset();
  });
  return (
    <SolidFlowProviderContext.Provider value={providerContext}>{props.children}</SolidFlowProviderContext.Provider>
  );
};
