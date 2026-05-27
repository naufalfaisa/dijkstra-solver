import { NodeItem, EdgeItem } from "../types/graph";

interface GraphEdgeProps {
  edge: EdgeItem;
  fromNode?: NodeItem;
  toNode?: NodeItem;
  isHighlighted: boolean;
}

export default function GraphEdge({
  fromNode,
  toNode,
  isHighlighted,
}: GraphEdgeProps) {
  if (!fromNode || !toNode) return null;

  return (
    <g>
      <line
        x1={fromNode.x}
        y1={fromNode.y}
        x2={toNode.x}
        y2={toNode.y}
        stroke={isHighlighted ? "#16a34a" : "#94a3b8"}
        strokeWidth={isHighlighted ? 4 : 2}
        strokeLinecap="round"
      />
    </g>
  );
}
