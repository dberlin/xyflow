import {
  Background,
  Controls,
  MiniMap,
  SolidFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
} from '@xyflow/solid';

import '@xyflow/solid/dist/style.css';

import { initialNodes, nodeTypes, type CustomNodeType } from './nodes';
import { initialEdges, edgeTypes, type CustomEdgeType } from './edges';

export default function App() {
  const [nodes, , onNodesChange] = useNodesState<CustomNodeType>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdgeType>(initialEdges);
  const onConnect: OnConnect = (connection) => setEdges((edges) => addEdge(connection, edges));

  return (
    <SolidFlow<CustomNodeType, CustomEdgeType>
      nodes={nodes()}
      nodeTypes={nodeTypes}
      onNodesChange={onNodesChange}
      edges={edges()}
      edgeTypes={edgeTypes}
      onEdgesChange={onEdgesChange}
      onConnect={onConnect}
      fitView
      width={1600}
      height={1200}
      debug={true}
    >
      <Background />
      <MiniMap />
      <Controls />
    </SolidFlow>
  );
}

