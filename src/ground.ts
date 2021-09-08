import { baseBlockX, blockSize } from 'config';
import { toBlock } from 'coords';
import { addDrawable } from 'drawables';

export function initGround() {
  addDrawable('ground', (context, { x1, x2 }) => {
    const blockX1 = toBlock(x1);
    const blockX2 = toBlock(x2);
    context.fillStyle = 'sienna';
    for (let blockX = blockX1; blockX <= blockX2; blockX += blockX === baseBlockX ? 2 : 1) {
      context.fillRect(blockX * blockSize, 0, blockSize, blockSize);
    }
  });
}
