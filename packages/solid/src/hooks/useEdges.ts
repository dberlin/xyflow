import { useStore } from '../hooks/useStore';
import type { Edge, SolidFlowStore } from '../types';

const edgesSelector = (state: SolidFlowStore) => state.edges;

/**
 * This hook returns an array of the current edges. Components that use this hook
 * will re-render **whenever any edge changes**.
 *
 * @public
 * @returns An array of edges
 *
 * @example
 * ```tsx
 *import { useEdges } from '@xyflow/solid';
 *
 *export default function () {
 *  const edges = useEdges();
 *
 *  return <div>There are currently {edges.length} edges!</div>;
 *}
 *```
 */
export function useEdges<EdgeType extends Edge = Edge>(): EdgeType[] {
  const edges = useStore(edgesSelector) as EdgeType[];

  return edges;
}
