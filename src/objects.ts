import { blockSize, lineHeightOffset } from 'config';
import { toBlock } from 'coords';
import { addDrawable } from 'drawables';
import { fps, globalFrame } from 'frame';
import { menuItemClick } from 'menu';
import { Point } from 'point';

type ObjectType = keyof typeof objectTypes;

export interface GameObject {
  type: ObjectType;
  topLeft: Point;
}

const baseObject: GameObject = { type: 'base', topLeft: new Point(-1, -3) };
const objects = new Set<GameObject>([
  baseObject,
  { type: 'solar', topLeft: new Point(-2, -1) },
  { type: 'battery', topLeft: new Point(-3, -1) },
  { type: 'turret', topLeft: new Point(-4, -1) },
]);
let activeObject = baseObject;

export function initObjects() {
  addDrawable('objects', (context, { x, y, x1, y1, x2, y2 }) => {
    const blockX = toBlock(x);
    const blockY = toBlock(y);
    const blockX1 = toBlock(x1);
    const blockY1 = toBlock(y1);
    const blockX2 = toBlock(x2);
    const blockY2 = toBlock(y2);

    for (const object of objects) {
      const { type, topLeft } = object;
      const objectContainedInCanvas = isWithin(
        topLeft.x,
        topLeft.y,
        blockX1 - objectTypes[type].width + 1,
        blockY1 - objectTypes[type].height + 1,
        blockX2,
        blockY2,
      );
      if (!objectContainedInCanvas) {
        continue;
      }
      objectTypes[type].draw(context, topLeft);

      const mouseContainedInObject = isWithin(
        blockX,
        blockY,
        topLeft.x,
        topLeft.y,
        topLeft.x + objectTypes[type].width - 1,
        topLeft.y + objectTypes[type].height - 1,
      );
      if (object === activeObject || mouseContainedInObject) {
        drawHover(context, topLeft, objectTypes[type]);
      }
    }
  });
}

export function getObjectFromCanvas({ x, y }: Point): GameObject | undefined {
  const blockX = toBlock(x);
  const blockY = toBlock(y);

  if (blockY >= 0) {
    return;
  }

  for (const object of objects) {
    const { type, topLeft } = object;
    const contained = isWithin(
      blockX,
      blockY,
      topLeft.x,
      topLeft.y,
      topLeft.x + objectTypes[type].width - 1,
      topLeft.y + objectTypes[type].height - 1,
    );
    if (contained) {
      return object;
    }
  }
}

export function objectClick(object: GameObject) {
  menuItemClick({ type: 'tab', name: 'info' });
  activeObject = object;
}

export function getActiveObject() {
  return activeObject;
}

const objectTypes = {
  base: {
    draw: (context: CanvasRenderingContext2D, { x, y }: Point) => {
      context.fillStyle = 'lightblue';
      context.fillRect(x * blockSize, y * blockSize, blockSize * 3, blockSize * 3);
      context.fillStyle = 'white';
      context.font = '16px monospace';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('💩', (x + 1.5) * blockSize, (y + 1.5) * blockSize + lineHeightOffset);
    },
    width: 3,
    height: 3,
  },
  solar: {
    draw: (context: CanvasRenderingContext2D, { x, y }: Point) => {
      context.fillStyle = 'lightblue';
      context.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
      context.fillStyle = 'white';
      context.font = '16px monospace';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('🌞', (x + 0.5) * blockSize, (y + 0.5) * blockSize + lineHeightOffset);
    },
    width: 1,
    height: 1,
  },
  battery: {
    draw: (context: CanvasRenderingContext2D, { x, y }: Point) => {
      context.fillStyle = 'lightblue';
      context.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
      context.fillStyle = 'white';
      context.font = '16px monospace';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('🔋', (x + 0.5) * blockSize, (y + 0.5) * blockSize + lineHeightOffset);
    },
    width: 1,
    height: 1,
  },
  turret: {
    draw: (context: CanvasRenderingContext2D, { x, y }: Point) => {
      context.fillStyle = 'salmon';
      context.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
      context.fillStyle = 'white';
      context.font = '16px monospace';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('🔫', (x + 0.5) * blockSize, (y + 0.5) * blockSize + lineHeightOffset);
    },
    width: 1,
    height: 1,
  },
} as const;

function drawHover(
  context: CanvasRenderingContext2D,
  { x, y }: Point,
  { width, height }: { width: number; height: number },
) {
  context.strokeStyle = 'white';
  context.setLineDash([5, 5]);
  context.lineDashOffset = Math.floor((globalFrame / fps) * -20);
  context.strokeRect(
    x * blockSize + 0.5,
    y * blockSize + 0.5,
    width * blockSize - 1,
    height * blockSize - 1,
  );
  context.setLineDash([]);
}

function isWithin(x: number, y: number, x1: number, y1: number, x2: number, y2: number) {
  return x >= x1 && x <= x2 && y >= y1 && y <= y2;
}
