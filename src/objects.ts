import { blockSize } from 'config';
import { toBlock } from 'coords';
import { addDrawable } from 'drawables';
import { menuItemClick } from 'menu';
import { drawHover, ForegroundObject, foregroundObjects } from 'objectTypes';
import { Point } from 'point';

const baseObjectBlockX = -1;
const objects = new Map<number, ForegroundObject>([
  [baseObjectBlockX, 'base'],
  [-2, 'solar'],
  [-3, 'battery'],
  [-4, 'turret'],
]);
let activeObjectBlockX = baseObjectBlockX;

export function initObjects() {
  addDrawable('objects', (context, { position, x1, y1, width, height }) => {
    for (const [blockX, type] of objects) {
      const topLeft = new Point(blockX * blockSize, -foregroundObjects[type].height);
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
      if (blockX === activeObjectBlockX || mouseContainedInObject) {
        drawHover(context, topLeft, foregroundObjects[type]);
      }
    }
  });
}

export function getObjectBlockXFromCanvas({ x, y }: Point): number | undefined {
  const blockX = toBlock(x);
  const normalizedBlockX = blockX === 0 || blockX === 1 ? -1 : blockX;
  const object = objects.get(normalizedBlockX);
  if (!object) {
    return;
  }
  if (y <= 0 && y >= -foregroundObjects[object].height) {
    return normalizedBlockX;
  }
}

export function objectClick(blockX: number) {
  menuItemClick({ type: 'tab', name: 'info' });
  activeObjectBlockX = blockX;
}

export function getActiveObject() {
  return objects.get(activeObjectBlockX)!;
}
