import { Background, Controls, MiniMap, SolidFlow, SolidFlowProvider } from '@xyflow/solid';
import { attachDevtoolsOverlay } from '@solid-devtools/overlay'


import '@xyflow/solid/dist/style.css';

import { initialNodes, nodeTypes } from './nodes';
import { edgeTypes, initialEdges } from './edges';
import { SelectionMode } from '@xyflow/system';
import { createSignal } from 'solid-js';
import { Node, Edge} from '@xyflow/solid'


export default function App() {
  attachDevtoolsOverlay()

  /* const [getNodeData, setNodeData] = createSignal<Node[]>(initialNodes);
   const [getEdgeData, setEdgeData] = createSignal<Edge[]>(initialEdges);
   const props = {
     get nodes() {
       return getNodeData();
     },

     get edges() {
       return getEdgeData();
     },
   }*/
 let testNodes:Node[] = initialNodes;
 let testEdges:Edge[] = initialEdges;
  return (
    <SolidFlowProvider>
      <SolidFlow
        nodes={testNodes}
        setNodes={(x)=>{testNodes = x}}
        nodeTypes={nodeTypes}
        edges={testEdges}
        setEdges={(x)=>{testEdges = x}}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{
          padding: 0.1,
          nodes: [{ id: '1' }, { id: '2' }, { id: '3' }],
        }}
        initialViewport={{ x: 100, y: 100, zoom: 2 }}
        minZoom={0}
        maxZoom={Infinity}
        selectionMode={SelectionMode.Full}
        width={1600}
        height={1200}
        oninit={() => console.log('on init')}
        onnodeclick={(event) => console.log('on node click', event)}
        onnodepointerenter={(event) => console.log('on node enter', event)}
        onnodepointerleave={(event) => console.log('on node leave', event)}
        onedgeclick={(event) => console.log('edge click', event)}
        onedgepointerenter={(event) => console.log('edge enter', event)}
        onedgepointerleave={(event) => console.log('edge leave', event)}
        onconnectstart={(event) => console.log('on connect start', event)}
        onconnect={(event) => console.log('on connect', event)}
        onconnectend={(event) => console.log('on connect end', event)}
        onpaneclick={(event) => console.log('on pane click', event)}
        onpanecontextmenu={(event) => {
          console.log('on pane contextmenu', event);
        }}
        onnodedrag={(event) => {
          console.log('on node drag', event);
        }}
        onnodedragstart={(event) => {
          console.log('on node drag start', event);
        }}
        onnodedragstop={({ event }) => {
          console.log('on node drag stop', event);
        }}
        onnodecontextmenu={({ event }) => {
          event.preventDefault();
          console.log('on node contextmenu', event);
        }}
        onedgecontextmenu={({ event, edge }) => {
          event.preventDefault();
          console.log('on edge contextmenu', edge);
        }}
        onselectionclick={(event) => console.log('on selection click', event)}
        onselectioncontextmenu={(event) => console.log('on selection contextmenu', event)}
        onbeforedelete={async ({ nodes, edges }) => {
          console.log('on before delete', nodes, edges);
          return confirm('Are you sure you want to delete the selected elements?');
        }}
      >
        <Background />
        <MiniMap />
        <Controls />
      </SolidFlow>
    </SolidFlowProvider>
  );
}
