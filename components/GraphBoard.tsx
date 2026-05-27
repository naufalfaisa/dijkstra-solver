import React, { RefObject } from "react";
import { NodeItem, EdgeItem } from "../types/graph";
import GraphEdge from "./GraphEdge";
import GraphNode from "./GraphNode";
import { cn } from "../utils/cn";

interface GraphBoardProps {
  boardRef: RefObject<HTMLDivElement | null>;
  nodes: NodeItem[];
  edges: EdgeItem[];
  highlightedEdgeIds: Set<string>;
  highlightedNodeIds: Set<string>;
  selectedNodeId: string | null;
  pendingEdgeNodeId: string | null;
  getEdgeKey: (from: string, to: string) => string;
  onBoardClick: (event: React.MouseEvent<HTMLDivElement>) => void;
  onNodePointerDown: (
    event: React.PointerEvent<HTMLButtonElement>,
    id: string,
  ) => void;
  onNodeClick: (id: string) => void;
  onEditEdgeWeight: (edge: EdgeItem) => void;
}

export default function GraphBoard({
  boardRef,
  nodes,
  edges,
  highlightedEdgeIds,
  highlightedNodeIds,
  selectedNodeId,
  pendingEdgeNodeId,
  getEdgeKey,
  onBoardClick,
  onNodePointerDown,
  onNodeClick,
  onEditEdgeWeight,
}: GraphBoardProps) {
  const findNode = (id: string) => nodes.find((n) => n.id === id);

  return (
    <div className="p-2 sm:p-4 md:p-6">
      <div
        ref={boardRef}
        onClick={onBoardClick}
        className="relative h-[60vh] md:h-[72vh] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white select-none"
        style={{ touchAction: "none" }}
      >
        <svg className="pointer-events-none absolute inset-0 h-full w-full">
          {edges.map((edge) => (
            <GraphEdge
              key={edge.id}
              edge={edge}
              fromNode={findNode(edge.from)}
              toNode={findNode(edge.to)}
              isHighlighted={highlightedEdgeIds.has(
                getEdgeKey(edge.from, edge.to),
              )}
            />
          ))}
        </svg>

        <div className="pointer-events-none absolute inset-0">
          {edges.map((edge) => {
            const fromNode = findNode(edge.from);
            const toNode = findNode(edge.to);
            if (!fromNode || !toNode) return null;

            const leftPos = (fromNode.x + toNode.x) / 2;
            const topPos = (fromNode.y + toNode.y) / 2;

            const isHighlighted = highlightedEdgeIds.has(
              getEdgeKey(edge.from, edge.to),
            );

            return (
              <button
                key={"w-" + edge.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditEdgeWeight(edge);
                }}
                style={{ left: `${leftPos}px`, top: `${topPos}px` }}
                className={cn(
                  "pointer-events-auto absolute flex h-8 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-xs font-semibold shadow-sm transition-colors active:scale-95",
                  isHighlighted
                    ? "border-emerald-600 bg-emerald-100 text-emerald-800"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
                )}
              >
                {edge.weight}
              </button>
            );
          })}
        </div>

        {nodes.map((node) => (
          <GraphNode
            key={node.id}
            node={node}
            isHighlighted={highlightedNodeIds.has(node.id)}
            isSelected={selectedNodeId === node.id}
            isPendingEdge={pendingEdgeNodeId === node.id}
            onPointerDown={onNodePointerDown}
            onClick={onNodeClick}
          />
        ))}
      </div>
    </div>
  );
}
