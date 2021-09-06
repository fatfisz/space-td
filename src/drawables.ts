import { Point } from 'point';

type Priority = typeof priorityOrder[number];

interface DisplayState {
  position: Point;
  x: number;
  y: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
}

type Draw = (context: CanvasRenderingContext2D, displayState: DisplayState) => void;

const priorityOrder = ['objects', 'ground', 'grid'] as const;

const drawablePriorityId = Object.fromEntries(
  priorityOrder.map((name, index) => [name, index]),
) as Record<Priority, number>;

const drawables = new Map<number, [priorityId: number, draw: Draw]>();
let lastHandle = 0;

export function addDrawable(priority: Priority, draw: Draw) {
  lastHandle += 1;
  drawables.set(lastHandle, [drawablePriorityId[priority], draw]);
  return lastHandle;
}

export function removeDrawable(handle: number) {
  drawables.delete(handle);
}

export function drawDrawables(context: CanvasRenderingContext2D, displayState: DisplayState) {
  const drawGroupedByPriority = priorityOrder.map<Draw[]>(() => []);
  for (const [priority, draw] of drawables.values()) {
    drawGroupedByPriority[priority].push(draw);
  }
  for (const drawGroup of drawGroupedByPriority) {
    for (const draw of drawGroup) {
      draw(context, displayState);
    }
  }
}
