import { blockSize, lineHeightOffset } from 'config';
import { toBlock } from 'coords';
import { addDrawable } from 'drawables';
import { fps, globalFrame } from 'frame';
import { Point } from 'point';

const objects = new Set<[type: keyof typeof objectTypes, topLeft: Point]>([
  ['base', new Point(-1, -3)],
  ['solar', new Point(-2, -1)],
  ['battery', new Point(-3, -1)],
  ['turret', new Point(-4, -1)],
]);

export function initObjects() {
  addDrawable('objects', (context, { x, y, x1, y1, x2, y2 }) => {
    const blockX = toBlock(x);
    const blockY = toBlock(y);
    const blockX1 = toBlock(x1);
    const blockY1 = toBlock(y1);
    const blockX2 = toBlock(x2);
    const blockY2 = toBlock(y2);

    for (const [type, topLeft] of objects) {
      if (
        !isWithin(
          topLeft.x,
          topLeft.y,
          blockX1 - objectTypes[type].width + 1,
          blockY1 - objectTypes[type].height + 1,
          blockX2,
          blockY2,
        )
      ) {
        continue;
      }
      objectTypes[type].draw(context, topLeft);

      const contained = isWithin(
        blockX,
        blockY,
        topLeft.x,
        topLeft.y,
        topLeft.x + objectTypes[type].width - 1,
        topLeft.y + objectTypes[type].height - 1,
      );
      if (contained) {
        drawHover(context, topLeft, objectTypes[type]);
      }
    }
  });
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
};

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
