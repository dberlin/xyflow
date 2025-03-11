import { createEffect } from 'solid-js';

import { useSolidFlow } from './useSolidFlow';
import type { Edge, Node, OnInit } from '../types';

/**
 * Hook for calling onInit handler.
 *
 * @internal
 */
export function useOnInitHandler<NodeType extends Node = Node, EdgeType extends Edge = Edge>(
  onInit: OnInit<NodeType, EdgeType> | undefined
) {
  const rfInstance = useSolidFlow<NodeType, EdgeType>();
  let isInitialized = false;

  createEffect(() => {
    if (!isInitialized && rfInstance.viewportInitialized && onInit) {
      setTimeout(() => onInit(rfInstance), 1);
      isInitialized = true;
    }
  });
}
