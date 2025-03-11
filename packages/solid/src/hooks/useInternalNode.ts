import { Accessor } from 'solid-js';

import { useStore } from './useStore';
import type { InternalNode, Node } from '../types';

/**
 * This hook returns the internal representation of a specific node.
 * Components that use this hook will re-render **whenever the node changes**,
 * including when a node is selected or moved.
 *
 * @public
 * @param id - id of the node
 * @returns accessor function for the internal node
 *
 * @example
 * ```tsx
 *import { useInternalNode } from '@xyflow/solid';
 *
 *export default function () {
 *  const internalNode = useInternalNode('node-1');
 *  const absolutePosition = internalNode()?.internals.positionAbsolute;
 *
 *  return (
 *    <div>
 *      The absolute position of the node is at:
 *      <p>x: {absolutePosition?.x}</p>
 *      <p>y: {absolutePosition?.y}</p>
 *    </div>
 *  );
 *}
 *```
 */
export function useInternalNode<NodeType extends Node = Node>(
  id: string
): Accessor<InternalNode<NodeType> | undefined> {
  return () => useStore((s) => s.nodeLookup.get(id) as InternalNode<NodeType> | undefined);
}
