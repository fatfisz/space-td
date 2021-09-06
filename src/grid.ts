import { colors } from 'colors';
import { blockSize } from 'config';
import { toBlock } from 'coords';
import { addDrawable } from 'drawables';

export function initGrid() {
  addDrawable('grid', (context, { x1, y1, x2, y2, width, height }) => {
    context.beginPath();
    for (let x = toBlock(x1) * blockSize; x < x2; x += blockSize) {
      context.moveTo(x, y1);
      context.lineTo(x, y2);
    }
    for (let y = toBlock(y1) * blockSize; y < y2; y += blockSize) {
      context.moveTo(x1, y);
      context.lineTo(x2, y);
    }
    context.lineWidth = 1;
    context.strokeStyle = `${colors.white}3`;
    context.stroke();
    context.strokeRect(x1, y1, width, height);
  });
}
