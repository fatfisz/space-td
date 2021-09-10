import { colors } from 'colors';
import { baseBlockX, baseSize, blockSize, maxOffsetX } from 'config';
import { toBlock } from 'coords';
import { addDrawable } from 'drawables';
import { menuItemClick } from 'menu';
import {
  BuildableObjectName,
  buildableObjects,
  drawHover,
  ForegroundObject,
  foregroundObjects,
} from 'objectTypes';
import { Point } from 'point';

const objects = new Map<number, ForegroundObject>([
  [baseBlockX, foregroundObjects.base(baseBlockX)],
]);
let minBlockX = baseBlockX;
let maxBlockX = baseBlockX + 2;
let activeObjectBlockX: number | undefined;
let activeBuildableObjectName: BuildableObjectName | undefined;

export function initObjects() {
  addDrawable('objects', (context, { position, x1, x2 }) => {
    const blockX1 = toBlock(x1);
    const blockX2 = toBlock(x2);
    for (let blockX = blockX1; blockX <= blockX2; blockX += blockX === baseBlockX ? baseSize : 1) {
      const object = objects.get(blockX);
      if (!object) {
        if (activeBuildableObjectName) {
          drawBuiltObject(context, blockX, position);
        }
        continue;
      }
      const topLeft = new Point(blockX * blockSize, -object.height);
      object.draw(context, topLeft);

      const mouseContainedInObject = position.within(
        topLeft.x,
        topLeft.y,
        object.width,
        object.height,
      );
      if (blockX === activeObjectBlockX || mouseContainedInObject) {
        drawHover(context, topLeft, object);
      }
    }
  });

  addDrawable('backgroundObjects', (context) => {
    context.strokeStyle = colors.red;
    for (const object of objects.values()) {
      if (object.name !== 'turret') {
        continue;
      }
      context.lineWidth = object.power / 2;
      context.beginPath();
      for (const target of object.targets) {
        context.moveTo(object.mid.x, object.mid.y);
        context.lineTo(target.position.x, target.position.y);
      }
      context.stroke();
    }
    context.lineWidth = 1;
  });
}

export function updateObjects() {
  for (const object of objects.values()) {
    Object.assign(object, object.reduceState(object as never, {}));
  }
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
  const height = object?.height ?? blockSize;
  if (y <= 0 && y >= -height) {
    return normalizedBlockX;
  }
}

export function objectClick(blockX: number | undefined) {
  if (typeof blockX === 'undefined') {
    activeObjectBlockX = undefined;
    activeBuildableObjectName = undefined;
  } else if (objects.has(blockX)) {
    activeObjectBlockX = blockX;
    menuItemClick({ type: 'tab', name: 'info' });
  } else if (activeBuildableObjectName) {
    addObject(blockX, activeBuildableObjectName);
  }
}

function addObject(blockX: number, buildableObjectName: BuildableObjectName) {
  minBlockX = Math.min(blockX, minBlockX);
  maxBlockX = Math.max(blockX, maxBlockX);
  const object = buildableObjects[buildableObjectName](blockX);
  objects.set(blockX, object);
}

export function getActiveObject() {
  return typeof activeObjectBlockX !== 'undefined' ? objects.get(activeObjectBlockX) : undefined;
}

export function getActiveBuildableObjectName() {
  return activeBuildableObjectName;
}

export function setActiveBuildableObject(buildableObjectName: BuildableObjectName) {
  activeBuildableObjectName = buildableObjectName;
}

export function getObjectsRangeWithOffset(): [min: number, max: number] {
  return [minBlockX * blockSize - maxOffsetX, (maxBlockX + 1) * blockSize - 1 + maxOffsetX];
}
