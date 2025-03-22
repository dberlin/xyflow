import { BaseEdge, Edge, EdgeLabelRenderer, EdgeProps, getBezierPath, useSolidFlow, useEdges } from '@xyflow/solid';

const buttonStyle = {
  width: "20",
  height: "20",
  background: '#eee',
  border: '1px solid #fff',
  cursor: 'pointer',
  borderRadius: '50%',
  fontSize: '12px',
  lineHeight: 1,
};

type ButtonEdgeData = {};

export type ButtonEdge = Edge<ButtonEdgeData>;

export default function ButtonEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = "",
  markerEnd,
}: EdgeProps<ButtonEdge>) {
  const edges = useEdges();
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const onEdgeClick = () => {
    const newEdges = edges.current.filter((edge) => edge.id !== id);
    edges.set(newEdges);
  };

  return (
    <>
      <BaseEdge path={edgePath} marker-end={markerEnd} style={style} />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            'font-size': '12',
            // everything inside EdgeLabelRenderer has no pointer events by default
            // if you have an interactive element, set pointer-events: all
            'pointer-events': 'all',
          }}
          class="nodrag nopan"
        >
          <button style={buttonStyle} onClick={onEdgeClick}>
            ×
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
