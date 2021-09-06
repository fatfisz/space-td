import { blockSize, verticalTextOffset } from 'config';
import { fps, globalFrame } from 'frame';
import { Point } from 'point';

export type BaseObject = 'base';

export type MainObject = keyof typeof mainObjects;

export interface ForegroundObject {
  type: BaseObject | MainObject;
  topLeft: Point;
}

export type BuildableObject = keyof typeof buildableObjects;

const baseObject = {
  draw: (context: CanvasRenderingContext2D, { x, y }: Point) => {
    context.fillStyle = 'lightblue';
    context.fillRect(x, y, blockSize * 3, blockSize * 3);
    context.fillStyle = 'white';
    context.font = '16px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('💩', x + 1.5 * blockSize, y + 1.5 * blockSize + verticalTextOffset);
  },
  width: 3 * blockSize,
  height: 3 * blockSize,
} as const;

export const mainObjects = {
  solar: {
    draw: (context: CanvasRenderingContext2D, { x, y }: Point) => {
      context.fillStyle = 'lightblue';
      context.fillRect(x, y, blockSize, blockSize);
      context.fillStyle = 'white';
      context.font = '16px monospace';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('🌞', x + 0.5 * blockSize, y + 0.5 * blockSize + verticalTextOffset);
    },
    width: blockSize,
    height: blockSize,
  },
  battery: {
    draw: (context: CanvasRenderingContext2D, { x, y }: Point) => {
      context.fillStyle = 'lightblue';
      context.fillRect(x, y, blockSize, blockSize);
      context.fillStyle = 'white';
      context.font = '16px monospace';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('🔋', x + 0.5 * blockSize, y + 0.5 * blockSize + verticalTextOffset);
    },
    width: blockSize,
    height: blockSize,
  },
  turret: {
    draw: (context: CanvasRenderingContext2D, { x, y }: Point) => {
      context.fillStyle = 'salmon';
      context.fillRect(x, y, blockSize, blockSize);
      context.fillStyle = 'white';
      context.font = '16px monospace';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('🔫', x + 0.5 * blockSize, y + 0.5 * blockSize + verticalTextOffset);
    },
    width: blockSize,
    height: blockSize,
  },
} as const;

export const foregroundObjects = {
  base: baseObject,
  ...mainObjects,
};

export const buildableObjects = { ...mainObjects };

export function drawHover(
  context: CanvasRenderingContext2D,
  { x, y }: Point,
  { width, height }: { width: number; height: number },
) {
  context.strokeStyle = 'white';
  context.setLineDash([5, 5]);
  context.lineDashOffset = Math.floor((globalFrame / fps) * -20);
  context.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
  context.setLineDash([]);
}
