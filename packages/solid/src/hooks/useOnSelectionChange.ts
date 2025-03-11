import { createEffect, onCleanup } from 'solid-js';

import { useStoreApi } from './useStore';
import type { Edge, Node, OnSelectionChangeFunc } from '../types';

export type UseOnSelectionChangeOptions<NodeType extends Node = Node, EdgeType extends Edge = Edge> = {
  onChange: OnSelectionChangeFunc<NodeType, EdgeType>;
};

/**
 * This hook lets you listen for changes to both node and edge selection. As the
 *name implies, the callback you provide will be called whenever the selection of
 *_either_ nodes or edges changes.
 *
 * @public
 * @param params.onChange - The handler to register
 *
 * @example
 * ```jsx
 *import { createSignal, createMemo } from 'solid-js';
 *import { SolidFlow, useOnSelectionChange } from '@xyflow/solid';
 *
 *function SelectionDisplay() {
 *  const [selectedNodes, setSelectedNodes] = createSignal([]);
 *  const [selectedEdges, setSelectedEdges] = createSignal([]);
 *
 *  // the passed handler has to be memoized, otherwise the hook will not work correctly
 *  const onChange = createMemo(() => ({ nodes, edges }) => {
 *    setSelectedNodes(nodes.map((node) => node.id));
 *    setSelectedEdges(edges.map((edge) => edge.id));
 *  });
 *
 *  useOnSelectionChange({
 *    onChange: onChange(),
 *  });
 *
 *  return (
 *    <div>
 *      <p>Selected nodes: {selectedNodes().join(', ')}</p>
 *      <p>Selected edges: {selectedEdges().join(', ')}</p>
 *    </div>
 *  );
 *}
 *```
 *
 * @remarks You need to memoize the passed `onChange` handler using createMemo, otherwise the hook will not work correctly.
 */
export function useOnSelectionChange<NodeType extends Node = Node, EdgeType extends Edge = Edge>({
  onChange,
}: UseOnSelectionChangeOptions<NodeType, EdgeType>) {
  const store = useStoreApi<NodeType, EdgeType>();

  createEffect(() => {
    const nextOnSelectionChangeHandlers = [...store.getState().onSelectionChangeHandlers, onChange];
    store.setState({ onSelectionChangeHandlers: nextOnSelectionChangeHandlers });

    onCleanup(() => {
      const nextHandlers = store.getState().onSelectionChangeHandlers.filter((fn) => fn !== onChange);
      store.setState({ onSelectionChangeHandlers: nextHandlers });
    });
  });
}
