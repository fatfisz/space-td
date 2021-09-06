import { toBlock } from 'coords';
import { addDrawable } from 'drawables';
import { menuItemClick } from 'menu';
import { drawHover, GameObject, objectTypes } from 'objectTypes';
import { Point } from 'point';

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

function isWithin(x: number, y: number, x1: number, y1: number, x2: number, y2: number) {
  return x >= x1 && x <= x2 && y >= y1 && y <= y2;
}
