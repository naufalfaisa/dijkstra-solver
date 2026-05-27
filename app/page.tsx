"use client";

import { useGraphSolver } from "../hooks/useGraphSolver";
import Header from "../components/Header";
import GraphNavbar from "../components/GraphNavbar";
import GraphBoard from "../components/GraphBoard";

export default function Home() {
  const {
    boardRef,
    mode,
    setMode,
    nodes,
    edges,
    pendingEdgeNodeId,
    setPendingEdgeNodeId,
    startLabel,
    setStartLabel,
    endLabel,
    setEndLabel,
    result,
    isRunning,
    highlightedNodeIds,
    highlightedEdgeIds,
    handleBoardClick,
    handleNodePointerDown,
    handleNodeClick,
    editEdgeWeight,
    selectedNodeId,
    deleteSelectedNode,
    clearBoard,
    runSolver,
    getEdgeKey,
  } = useGraphSolver();

  const toggleMode = (targetMode: "add-node" | "add-edge") => {
    setMode((prev) => (prev === targetMode ? "idle" : targetMode));
    setPendingEdgeNodeId(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header />

      <GraphNavbar
        startLabel={startLabel}
        setStartLabel={setStartLabel}
        endLabel={endLabel}
        setEndLabel={setEndLabel}
        mode={mode}
        isRunning={isRunning}
        result={result}
        selectedNodeId={selectedNodeId}
        hasNodes={nodes.length > 0}
        onToggleMode={toggleMode}
        onDeleteNode={deleteSelectedNode}
        onClear={clearBoard}
        onRun={runSolver}
      />

      <GraphBoard
        boardRef={boardRef}
        nodes={nodes}
        edges={edges}
        highlightedEdgeIds={highlightedEdgeIds}
        highlightedNodeIds={highlightedNodeIds}
        selectedNodeId={selectedNodeId}
        pendingEdgeNodeId={pendingEdgeNodeId}
        getEdgeKey={getEdgeKey}
        onBoardClick={handleBoardClick}
        onNodePointerDown={handleNodePointerDown}
        onNodeClick={handleNodeClick}
        onEditEdgeWeight={editEdgeWeight}
      />
    </div>
  );
}
