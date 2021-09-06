import { blockSize } from 'config';
import { toBlock } from 'coords';
import { addDrawable } from 'drawables';
import { menuItemClick } from 'menu';
import { drawHover, ForegroundObject, foregroundObjects } from 'objectTypes';
import { Point } from 'point';

const baseObject: ForegroundObject = {
  type: 'base',
  topLeft: new Point(-blockSize, -3 * blockSize),
};
const objects = new Set<ForegroundObject>([
  baseObject,
  { type: 'solar', topLeft: new Point(-2 * blockSize, -blockSize) },
  { type: 'battery', topLeft: new Point(-3 * blockSize, -blockSize) },
  { type: 'turret', topLeft: new Point(-4 * blockSize, -blockSize) },
]);
let activeObject = baseObject;

export function initObjects() {
  addDrawable('objects', (context, { position, x1, y1, width, height }) => {
    for (const object of objects) {
      const { type, topLeft } = object;
      const objectContainedInCanvas = topLeft.within(
        x1 - foregroundObjects[type].width,
        y1 - foregroundObjects[type].height,
        width + foregroundObjects[type].width,
        height + foregroundObjects[type].height,
      );
      if (!objectContainedInCanvas) {
        continue;
      }
      foregroundObjects[type].draw(context, topLeft);

      const mouseContainedInObject = position.within(
        topLeft.x,
        topLeft.y,
        foregroundObjects[type].width,
        foregroundObjects[type].height,
      );
      if (object === activeObject || mouseContainedInObject) {
        drawHover(context, topLeft, foregroundObjects[type]);
      }
    }
  });
}

export function getObjectFromCanvas({ x, y }: Point): ForegroundObject | undefined {
  const blockPoint = new Point(toBlock(x), toBlock(y));
  if (blockPoint.y >= 0) {
    return;
  }
  for (const object of objects) {
    const { type, topLeft } = object;
    const contained = blockPoint.within(
      topLeft.x,
      topLeft.y,
      foregroundObjects[type].width,
      foregroundObjects[type].height,
    );
    if (contained) {
      return object;
    }
  }
}

export function objectClick(object: ForegroundObject) {
  menuItemClick({ type: 'tab', name: 'info' });
  activeObject = object;
}

export function getActiveObject() {
  return activeObject;
}
