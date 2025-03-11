import { createSignal } from 'solid-js';

import { applyEdgeChanges, applyNodeChanges } from '../utils/changes';
import type { Edge, Node, OnEdgesChange, OnNodesChange } from '../types';

/**
 * This hook makes it easy to prototype a controlled flow where you manage the
 * state of nodes and edges outside the `SolidFlowInstance`. You can think of it
 * like Solid's `createSignal` function with an additional helper callback.
 *
 * @public
 * @param initialNodes
 * @returns an array [nodes, setNodes, onNodesChange]
 * @example
 *
 *```tsx
 *import { SolidFlow, useNodesState, useEdgesState } from '@xyflow/solid';
 *
 *const initialNodes = [];
 *const initialEdges = [];
 *
 *export default function () {
 *  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
 *  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
 *
 *  return (
 *    <SolidFlow
 *      nodes={nodes()}
 *      edges={edges()}
 *      onNodesChange={onNodesChange}
 *      onEdgesChange={onEdgesChange}
 *    />
 *  );
 *}
 *```
 *
 * @remarks This hook was created to make prototyping easier and our documentation
 * examples clearer. Although it is OK to use this hook in production, in
 * practice you may want to use a more sophisticated state management solution
 * like Solid signals directly.
 *
 */
export function useNodesState<NodeType extends Node>(
  initialNodes: NodeType[]
): [() => NodeType[], (nodes: NodeType[] | ((prev: NodeType[]) => NodeType[])) => void, OnNodesChange<NodeType>] {
  const [nodes, setNodes] = createSignal<NodeType[]>(initialNodes);

  const onNodesChange: OnNodesChange<NodeType> = (changes) => {
    setNodes((nds) => applyNodeChanges(changes, nds));
  };

  return [nodes, setNodes, onNodesChange];
}

/**
 * This hook makes it easy to prototype a controlled flow where you manage the
 * state of nodes and edges outside the `SolidFlowInstance`. You can think of it
 * like Solid's `createSignal` function with an additional helper callback.
 *
 * @public
 * @param initialEdges
 * @returns an array [edges, setEdges, onEdgesChange]
 * @example
 *
 *```tsx
 *import { SolidFlow, useNodesState, useEdgesState } from '@xyflow/solid';
 *
 *const initialNodes = [];
 *const initialEdges = [];
 *
 *export default function () {
 *  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
 *  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
 *
 *  return (
 *    <SolidFlow
 *      nodes={nodes()}
 *      edges={edges()}
 *      onNodesChange={onNodesChange}
 *      onEdgesChange={onEdgesChange}
 *    />
 *  );
 *}
 *```
 *
 * @remarks This hook was created to make prototyping easier and our documentation
 * examples clearer. Although it is OK to use this hook in production, in
 * practice you may want to use a more sophisticated state management solution
 * like Solid signals directly.
 *
 */
export function useEdgesState<EdgeType extends Edge = Edge>(
  initialEdges: EdgeType[]
): [() => EdgeType[], (edges: EdgeType[] | ((prev: EdgeType[]) => EdgeType[])) => void, OnEdgesChange<EdgeType>] {
  const [edges, setEdges] = createSignal<EdgeType[]>(initialEdges);

  const onEdgesChange: OnEdgesChange<EdgeType> = (changes) => {
    setEdges((eds) => applyEdgeChanges(changes, eds));
  };

  return [edges, setEdges, onEdgesChange];
}
