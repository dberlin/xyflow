import { useStore } from '../hooks/useStore';
import type { Node, SolidFlowStore } from '../types';

const nodesSelector = (state: SolidFlowStore) => state.nodes;

/**
 * This hook returns an array of the current nodes. Components that use this hook
 * will re-render **whenever any node changes**, including when a node is selected
 * or moved.
 *
 * @public
 * @returns An array of nodes
 *
 * @example
 * ```jsx
 *import { useNodes } from '@xyflow/solid';
 *
 *export default function() {
 *  const nodes = useNodes();
 *
 *  return <div>There are currently {nodes.length} nodes!</div>;
 *}
 *```
 */
export function useNodes<NodeType extends Node = Node>(): NodeType[] {
  const nodes = useStore(nodesSelector) as NodeType[];

  return nodes;
}
