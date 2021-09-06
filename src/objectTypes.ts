import { blockSize, lineHeightOffset } from 'config';
import { fps, globalFrame } from 'frame';
import { Point } from 'point';

export type ObjectType = keyof typeof objectTypes;

export interface GameObject {
  type: ObjectType;
  topLeft: Point;
}

export const objectTypes = {
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

export function drawHover(
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
