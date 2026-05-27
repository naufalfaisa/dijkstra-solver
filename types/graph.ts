export type Mode = "idle" | "add-node" | "add-edge";

export interface NodeItem {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface EdgeItem {
  id: string;
  from: string;
  to: string;
  weight: number;
}

export interface DragState {
  nodeId: string;
  offsetX: number;
  offsetY: number;
}

export interface ResultState {
  distance: number;
  path: string[];
}
