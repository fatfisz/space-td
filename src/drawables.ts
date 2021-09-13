import { Point } from 'point';

type Priority = typeof priorityOrder[number];

interface DisplayState {
  position: Point;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  width: number;
  height: number;
}

type Draw = (context: CanvasRenderingContext2D, displayState: DisplayState) => void;

const priorityOrder = [
  'backgroundObjects',
  'objects',
  'ground',
  'decorative',
  'particles',
] as const;

const drawablePriorityId = Object.fromEntries(
  priorityOrder.map((name, index) => [name, index]),
) as Record<Priority, number>;

const drawables = new Set<[priorityId: number, draw: Draw]>();

export function addDrawable(priority: Priority, draw: Draw) {
  drawables.add([drawablePriorityId[priority], draw]);
}

export function drawDrawables(context: CanvasRenderingContext2D, displayState: DisplayState) {
  const drawGroupedByPriority = priorityOrder.map<Draw[]>(() => []);
  for (const [priority, draw] of drawables) {
    drawGroupedByPriority[priority].push(draw);
  }
  for (const drawGroup of drawGroupedByPriority) {
    for (const draw of drawGroup) {
      draw(context, displayState);
    }
  }
}
