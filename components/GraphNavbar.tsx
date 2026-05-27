import { Mode, ResultState } from "../types/graph";
import { cn } from "../utils/cn";

interface GraphNavbarProps {
  mode: Mode;
  isRunning: boolean;
  result: ResultState | null;
  selectedNodeId: string | null;
  hasNodes: boolean;
  startLabel: string;
  setStartLabel: (val: string) => void;
  endLabel: string;
  setEndLabel: (val: string) => void;
  onToggleMode: (targetMode: "add-node" | "add-edge") => void;
  onDeleteNode: () => void;
  onClear: () => void;
  onRun: () => void;
}

export default function GraphNavbar({
  mode,
  isRunning,
  result,
  selectedNodeId,
  hasNodes,
  startLabel,
  setStartLabel,
  endLabel,
  setEndLabel,
  onToggleMode,
  onDeleteNode,
  onClear,
  onRun,
}: GraphNavbarProps) {
  return (
    <nav className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 p-4 lg:flex-row lg:items-center lg:justify-between lg:px-6 lg:py-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-wrap lg:flex-nowrap">
        <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3">
          <button
            onClick={() => onToggleMode("add-node")}
            className={cn(
              "rounded-md px-4 py-2.5 sm:py-2 text-sm font-medium transition-colors text-center",
              mode === "add-node"
                ? "bg-sky-600 text-white"
                : "bg-slate-200 text-slate-800 hover:bg-slate-300",
            )}
          >
            Add node
          </button>

          <button
            onClick={() => onToggleMode("add-edge")}
            className={cn(
              "rounded-md px-4 py-2.5 sm:py-2 text-sm font-medium transition-colors text-center",
              mode === "add-edge"
                ? "bg-amber-500 text-white"
                : "bg-slate-200 text-slate-800 hover:bg-slate-300",
            )}
          >
            Add edge
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            value={startLabel}
            onChange={(e) => setStartLabel(e.target.value)}
            placeholder="Start"
            className="w-full sm:w-20 md:w-24 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
          <span className="text-slate-400 text-xs font-bold">to</span>
          <input
            value={endLabel}
            onChange={(e) => setEndLabel(e.target.value)}
            placeholder="End"
            className="w-full sm:w-20 md:w-24 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onRun}
            disabled={isRunning}
            className={cn(
              "w-full sm:w-auto justify-center flex items-center rounded-md px-5 py-2.5 sm:py-2 text-sm font-semibold text-white transition-colors",
              isRunning
                ? "bg-emerald-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700",
            )}
          >
            {isRunning ? "RUN..." : "RUN"}
          </button>

          {result && (
            <div className="whitespace-nowrap rounded-md bg-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">
              Dist: {result.distance}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end lg:flex-wrap">
        {selectedNodeId && (
          <button
            onClick={onDeleteNode}
            className="w-full sm:w-auto rounded-md bg-orange-400 px-4 py-2.5 sm:py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-500 text-center"
          >
            Delete selected
          </button>
        )}

        {hasNodes && (
          <button
            onClick={onClear}
            className="w-full sm:w-auto rounded-md bg-rose-500 px-4 py-2.5 sm:py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-600 text-center"
          >
            Clear
          </button>
        )}
      </div>
    </nav>
  );
}
