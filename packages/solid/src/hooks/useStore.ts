import { useContext } from 'solid-js';
// import { UseBoundStoreWithEqualityFn, useStoreWithEqualityFn as useZustandStore } from 'zustand/traditional';
import { errorMessages } from '@xyflow/system';

import StoreContext from '../contexts/StoreContext';
import { Edge, Node, SolidFlowActions, SolidFlowStore } from '../types';

const zustandErrorMessage = errorMessages['error001']();

/**
 * This hook can be used to subscribe to internal state changes of the Solid Flow
 * component. The `useStore` hook is re-exported from the [Zustand](https://github.com/pmndrs/zustand)
 * state management library, so you should check out their docs for more details.
 *
 * @public
 * @param selector
 * @param equalityFn
 * @returns The selected state slice
 *
 * @example
 * ```ts
 * const nodes = useStore((state) => state.nodes);
 * ```
 *
 * @remarks This hook should only be used if there is no other way to access the internal
 * state. For many of the common use cases, there are dedicated hooks available
 * such as {@link useSolidFlow}, {@link useViewport}, etc.
 */

function useStore<StateSlice>(selector: (state: SolidFlowStore) => StateSlice) {
  const api = useContext(StoreContext);

  if (api === null) {
    throw new Error(zustandErrorMessage);
  }
  return selector(api.getState());
}

export type StoreApiType<NodeType extends Node, EdgeType extends Edge> = {
  getState: () => SolidFlowStore<NodeType, EdgeType>;
  setState: (state: Partial<SolidFlowStore<NodeType, EdgeType>>) => void;
  getActions: () => SolidFlowActions<NodeType, EdgeType>;
};

/**
 * In some cases, you might need to access the store directly. This hook returns the store object which can be used on demand to access the state or dispatch actions.
 *
 * @returns The store object
 *
 * @example
 * ```ts
 * const store = useStoreApi();
 * ```
 *
 * @remarks This hook should only be used if there is no other way to access the internal
 * state. For many of the common use cases, there are dedicated hooks available
 * such as {@link useSolidFlow}, {@link useViewport}, etc.
 */
function useStoreApi<NodeType extends Node = Node, EdgeType extends Edge = Edge>(): StoreApiType<NodeType, EdgeType> {
  const store = useContext(StoreContext);

  if (store === null) {
    throw new Error(zustandErrorMessage);
  }

  return {
    getState: (): SolidFlowStore<NodeType, EdgeType> => store.getState() as SolidFlowStore<NodeType, EdgeType>,
    setState: (state: Partial<SolidFlowStore<NodeType, EdgeType>>) => store.setState(state),
    getActions: (): SolidFlowActions<NodeType, EdgeType> => store as SolidFlowActions<NodeType, EdgeType>,
  };
}

export { useStore, useStoreApi };
