import { useState, useRef, useMemo, useEffect } from "react";
import {
  Mode,
  NodeItem,
  EdgeItem,
  DragState,
  ResultState,
} from "../types/graph";

const NODE_SIZE = 56;
const DRAG_THRESHOLD = 8;
const BACKEND_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000";

export function useGraphSolver() {
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [mode, setMode] = useState<Mode>("idle");
  const [nodes, setNodes] = useState<NodeItem[]>([]);
  const [edges, setEdges] = useState<EdgeItem[]>([]);
  const [pendingEdgeNodeId, setPendingEdgeNodeId] = useState<string | null>(
    null,
  );
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [startLabel, setStartLabel] = useState("");
  const [endLabel, setEndLabel] = useState("");
  const [result, setResult] = useState<ResultState | null>(null);
  const [pathNodeIds, setPathNodeIds] = useState<string[]>([]);
  const [pathEdgeKeys, setPathEdgeKeys] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const dragRef = useRef<DragState | null>(null);
  const dragCoords = useRef({
    startX: 0,
    startY: 0,
    hasMovedPastThreshold: false,
  });

  const generateLabel = (index: number): string => {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (index < alphabet.length) return alphabet[index];
    return `${alphabet[index % alphabet.length]}${Math.floor(index / alphabet.length)}`;
  };

  const getEdgeKey = (firstId: string, secondId: string) =>
    [firstId, secondId].sort().join("-");

  const highlightedNodeIds = useMemo(() => new Set(pathNodeIds), [pathNodeIds]);
  const highlightedEdgeIds = useMemo(
    () => new Set(pathEdgeKeys),
    [pathEdgeKeys],
  );

  const resetResult = () => {
    setResult(null);
    setPathNodeIds([]);
    setPathEdgeKeys([]);
  };

  const clearNodeSelection = () => setSelectedNodeId(null);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!dragRef.current || !boardRef.current) return;

      if (event.cancelable) event.preventDefault();

      const distanceX = Math.abs(event.clientX - dragCoords.current.startX);
      const distanceY = Math.abs(event.clientY - dragCoords.current.startY);

      if (distanceX > DRAG_THRESHOLD || distanceY > DRAG_THRESHOLD) {
        dragCoords.current.hasMovedPastThreshold = true;
      }

      const rect = boardRef.current.getBoundingClientRect();
      const nextX = Math.min(
        Math.max(
          event.clientX - rect.left - dragRef.current.offsetX,
          NODE_SIZE / 2,
        ),
        rect.width - NODE_SIZE / 2,
      );
      const nextY = Math.min(
        Math.max(
          event.clientY - rect.top - dragRef.current.offsetY,
          NODE_SIZE / 2,
        ),
        rect.height - NODE_SIZE / 2,
      );

      setNodes((prevNodes) =>
        prevNodes.map((n) =>
          n.id === dragRef.current?.nodeId ? { ...n, x: nextX, y: nextY } : n,
        ),
      );
    };

    const handlePointerUp = () => {
      dragRef.current = null;
    };
    const handlePointerCancel = () => {
      dragRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerCancel);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerCancel);
    };
  }, []);

  const handleBoardClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (mode !== "add-node" || !boardRef.current) {
      clearNodeSelection();
      setPendingEdgeNodeId(null);
      return;
    }

    const rect = boardRef.current.getBoundingClientRect();
    setNodes((prevNodes) => {
      const label = generateLabel(prevNodes.length);
      return [
        ...prevNodes,
        {
          id: `${label}-${Date.now()}`,
          label,
          x: Math.min(
            Math.max(event.clientX - rect.left, NODE_SIZE / 2),
            rect.width - NODE_SIZE / 2,
          ),
          y: Math.min(
            Math.max(event.clientY - rect.top, NODE_SIZE / 2),
            rect.height - NODE_SIZE / 2,
          ),
        },
      ];
    });
    resetResult();
  };

  const handleNodePointerDown = (
    event: React.PointerEvent<HTMLButtonElement>,
    nodeId: string,
  ) => {
    if (!boardRef.current) return;

    const target = event.target as HTMLElement;
    if (target && typeof target.setPointerCapture === "function") {
      target.setPointerCapture(event.pointerId);
    }

    const rect = boardRef.current.getBoundingClientRect();
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;

    dragCoords.current = {
      startX: event.clientX,
      startY: event.clientY,
      hasMovedPastThreshold: false,
    };
    dragRef.current = {
      nodeId,
      offsetX: event.clientX - rect.left - node.x,
      offsetY: event.clientY - rect.top - node.y,
    };
  };

  const handleNodeClick = (nodeId: string) => {
    if (dragCoords.current.hasMovedPastThreshold) {
      dragCoords.current.hasMovedPastThreshold = false;
      return;
    }

    if (mode === "idle" || mode === "add-node") {
      setSelectedNodeId((prev) => (prev === nodeId ? null : nodeId));
      setPendingEdgeNodeId(null);
      return;
    }

    if (mode !== "add-edge") return;
    if (!pendingEdgeNodeId) {
      setPendingEdgeNodeId(nodeId);
      return;
    }
    if (pendingEdgeNodeId === nodeId) return;

    const edgeKey = getEdgeKey(pendingEdgeNodeId, nodeId);
    if (edges.some((e) => e.id === edgeKey)) {
      setPendingEdgeNodeId(nodeId);
      return;
    }

    const weightInput = window.prompt("Weight edge", "1");
    const parsedWeight = Number(weightInput);

    if (weightInput !== null && !isNaN(parsedWeight) && parsedWeight > 0) {
      setEdges((prev) => [
        ...prev,
        {
          id: edgeKey,
          from: pendingEdgeNodeId,
          to: nodeId,
          weight: parsedWeight,
        },
      ]);
      setPendingEdgeNodeId(null);
      resetResult();
    }
  };

  const deleteSelectedNode = () => {
    if (!selectedNodeId) return;

    const nodeToDelete = nodes.find((n) => n.id === selectedNodeId);

    setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
    setEdges((prev) =>
      prev.filter((e) => e.from !== selectedNodeId && e.to !== selectedNodeId),
    );

    if (pendingEdgeNodeId === selectedNodeId) setPendingEdgeNodeId(null);

    if (nodeToDelete) {
      if (startLabel === nodeToDelete.label) setStartLabel("");
      if (endLabel === nodeToDelete.label) setEndLabel("");
    }

    clearNodeSelection();
    resetResult();
  };

  const editEdgeWeight = (edge: EdgeItem) => {
    const input = window.prompt("Weight edge", String(edge.weight));
    const parsed = Number(input);
    if (input !== null && !isNaN(parsed) && parsed > 0) {
      setEdges((prev) =>
        prev.map((e) => (e.id === edge.id ? { ...e, weight: parsed } : e)),
      );
      resetResult();
    }
  };

  const clearBoard = () => {
    if (window.confirm("Hapus semua node dan edge?")) {
      setNodes([]);
      setEdges([]);
      setPendingEdgeNodeId(null);
      clearNodeSelection();
      resetResult();
      setStartLabel("");
      setEndLabel("");
    }
  };

  const runSolver = async () => {
    setIsRunning(true);
    resetResult();

    try {
      const response = await fetch(`${BACKEND_BASE_URL}/solve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nodes: nodes,
          edges: edges.map((e) => ({
            id: e.id,
            from_node: e.from,
            to_node: e.to,
            weight: e.weight,
          })),
          start_label: startLabel,
          end_label: endLabel,
        }),
      });

      if (response.status === 429) {
        throw new Error("Terlalu banyak request. Tunggu 1 menit.");
      }

      const responseText = await response.text();
      let payload;
      try {
        payload = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error(`Server bermasalah (${response.status}).`);
      }

      if (response.status === 422 && payload.detail) {
        const msg = payload.detail.map((err: any) => err.msg).join(", ");
        throw new Error(`Input salah: ${msg}`);
      }

      if (!response.ok || payload.error) {
        throw new Error(payload.error || `Server Error (${response.status})`);
      }

      const fetchedPathNodeIds: string[] = payload.path_ids ?? [];
      setPathNodeIds(fetchedPathNodeIds);
      setPathEdgeKeys(
        fetchedPathNodeIds
          .slice(0, -1)
          .map((id, i) => getEdgeKey(id, fetchedPathNodeIds[i + 1])),
      );

      setResult({
        distance: payload.distance ?? 0,
        path: fetchedPathNodeIds.map(
          (id) => nodes.find((n) => n.id === id)?.label ?? id,
        ),
      });

    } catch (e: unknown) {
      if (e instanceof TypeError) {
        alert("Koneksi gagal. Backend mati atau CORS bermasalah.");
      } else if (e instanceof Error) {
        alert(e.message);
      } else {
        alert("Error tidak diketahui.");
      }
      resetResult();
    } finally {
      setIsRunning(false);
    }
  };

  return {
    boardRef,
    mode,
    setMode,
    nodes,
    edges,
    pendingEdgeNodeId,
    setPendingEdgeNodeId,
    selectedNodeId,
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
    deleteSelectedNode,
    clearBoard,
    runSolver,
    getEdgeKey,
  };
}
