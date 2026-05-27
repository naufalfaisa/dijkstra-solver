import { NodeItem } from "../types/graph";
import { cn } from "../utils/cn";

interface GraphNodeProps {
  node: NodeItem;
  isHighlighted: boolean;
  isSelected: boolean;
  isPendingEdge: boolean;
  onPointerDown: (
    event: React.PointerEvent<HTMLButtonElement>,
    id: string,
  ) => void;
  onClick: (id: string) => void;
}

export default function GraphNode({
  node,
  isHighlighted,
  isSelected,
  isPendingEdge,
  onPointerDown,
  onClick,
}: GraphNodeProps) {
  return (
    <button
      onPointerDown={(e) => onPointerDown(e, node.id)}
      onClick={(e) => {
        e.stopPropagation();
        onClick(node.id);
      }}
      style={{ left: `${node.x}px`, top: `${node.y}px` }}
      className={cn(
        "absolute flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-sm font-semibold shadow-sm transition-transform duration-150",

        isHighlighted && "border-emerald-600 bg-emerald-100 text-emerald-700",

        isSelected &&
          "border-orange-500 bg-orange-100 text-orange-700 ring-2 ring-orange-300",

        isPendingEdge && "border-amber-500 bg-amber-100 text-amber-700",

        !isHighlighted &&
          !isSelected &&
          !isPendingEdge &&
          "border-slate-300 bg-slate-50 text-slate-800 hover:bg-slate-100",
      )}
    >
      {node.label}
    </button>
  );
}
