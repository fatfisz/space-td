import { blockSize } from 'config';
import { toBlock } from 'coords';
import { addDrawable } from 'drawables';

export function initGround() {
  addDrawable('ground', (context, { x1, y1, x2, y2 }) => {
    const blockX1 = toBlock(x1);
    const blockY1 = toBlock(y1);
    const blockX2 = toBlock(x2);
    const blockY2 = toBlock(y2);

    if (blockY1 > 0 || blockY2 < 0) {
      return;
    }

    context.fillStyle = 'sienna';

    for (let x = blockX1; x < 0; x += 1) {
      context.fillRect(x * blockSize, 0, blockSize, blockSize);
    }
    for (let x = 1; x <= blockX2; x += 1) {
      context.fillRect(x * blockSize, 0, blockSize, blockSize);
    }
  });
}
