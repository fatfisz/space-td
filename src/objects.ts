import { colors } from 'colors';
import { baseBlockX, baseSize, blockSize, maxOffsetX } from 'config';
import { toBlock } from 'coords';
import { addDrawable } from 'drawables';
import { menuItemClick } from 'menu';
import { BuildableObject, drawHover, ForegroundObject, foregroundObjects } from 'objectTypes';
import { Point } from 'point';

const objects = new Map<number, ForegroundObject>([[baseBlockX, 'base']]);
let minBlockX = baseBlockX;
let maxBlockX = baseBlockX + 2;
let activeObjectBlockX: number | undefined;
let activeBuildableObject: BuildableObject | undefined;

export function initObjects() {
  addDrawable('objects', (context, { position, x1, x2 }) => {
    const blockX1 = toBlock(x1);
    const blockX2 = toBlock(x2);
    for (let blockX = blockX1; blockX <= blockX2; blockX += blockX === baseBlockX ? baseSize : 1) {
      const type = objects.get(blockX);
      if (!type) {
        if (activeBuildableObject) {
          drawBuiltObject(context, blockX, position);
        }
        continue;
      }
      const topLeft = new Point(blockX * blockSize, -foregroundObjects[type].height);
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

function drawBuiltObject(context: CanvasRenderingContext2D, blockX: number, position: Point) {
  const goodPlacement = position.within(blockX * blockSize, -blockSize, blockSize, blockSize);
  context.strokeStyle = goodPlacement ? colors.white : `${colors.white}8`;
  context.beginPath();
  context.arc((blockX + 0.5) * blockSize, -0.5 * blockSize, blockSize / 3, 0, 2 * Math.PI);
  context.moveTo((blockX + 0.3) * blockSize, -0.5 * blockSize);
  context.lineTo((blockX + 0.7) * blockSize, -0.5 * blockSize);
  context.moveTo((blockX + 0.5) * blockSize, -0.3 * blockSize);
  context.lineTo((blockX + 0.5) * blockSize, -0.7 * blockSize);
  context.stroke();
}

export function getObjectBlockXFromCanvas({ x, y }: Point): number | undefined {
  const blockX = toBlock(x);
  const normalizedBlockX =
    blockX > baseBlockX && blockX < baseBlockX + baseSize ? baseBlockX : blockX;
  const object = objects.get(normalizedBlockX);
  const height = object ? foregroundObjects[object].height : blockSize;
  if (y <= 0 && y >= -height) {
    return normalizedBlockX;
  }
}

export function objectClick(blockX: number | undefined) {
  if (typeof blockX === 'undefined') {
    activeObjectBlockX = undefined;
    activeBuildableObject = undefined;
  } else if (objects.has(blockX)) {
    activeObjectBlockX = blockX;
    menuItemClick({ type: 'tab', name: 'info' });
  } else if (activeBuildableObject) {
    addObject(blockX, activeBuildableObject);
  }
}

function addObject(blockX: number, buildableObject: BuildableObject) {
  minBlockX = Math.min(blockX, minBlockX);
  maxBlockX = Math.min(blockX, maxBlockX);
  objects.set(blockX, buildableObject);
}

export function getActiveObject() {
  return typeof activeObjectBlockX !== 'undefined' ? objects.get(activeObjectBlockX) : undefined;
}

export function getActiveBuildableObject() {
  return activeBuildableObject;
}

export function setActiveBuildableObject(buildableObject: BuildableObject) {
  activeBuildableObject = buildableObject;
}

export function getObjectsRangeWithOffset(): [min: number, max: number] {
  return [minBlockX * blockSize - maxOffsetX, (maxBlockX + 1) * blockSize - 1 + maxOffsetX];
}
