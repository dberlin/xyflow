import { createEffect, createSignal } from 'solid-js';
import { errorMessages } from '@xyflow/system';

import { useStoreApi } from '../../hooks/useStore';
import type { EdgeTypes, NodeTypes } from '../../types';

const emptyTypes = {};

/**
 * This hook warns the user if nodeTypes or edgeTypes changed.
 * It is only used in development mode.
 *
 * @internal
 */
export function useNodeOrEdgeTypesWarning(nodeOrEdgeTypes?: NodeTypes): void;
export function useNodeOrEdgeTypesWarning(nodeOrEdgeTypes?: EdgeTypes): void;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useNodeOrEdgeTypesWarning(nodeOrEdgeTypes: any = emptyTypes): any {
  const [typesRef, setTypesRef] = createSignal(nodeOrEdgeTypes);
  const store = useStoreApi();

  createEffect(() => {
    // Access nodeOrEdgeTypes directly to track it as a dependency
    const currentNodeOrEdgeTypes = nodeOrEdgeTypes;

    if (process.env.NODE_ENV === 'development') {
      const usedKeys = new Set([...Object.keys(typesRef()), ...Object.keys(currentNodeOrEdgeTypes)]);

      for (const key of usedKeys) {
        if (typesRef()[key] !== currentNodeOrEdgeTypes[key]) {
          store.getState().onError?.('002', errorMessages['error002']());
          break;
        }
      }

      setTypesRef(currentNodeOrEdgeTypes);
    }
  });
}
