import { colors } from 'colors';
import { blockSize } from 'config';
import { floorToBlock } from 'coords';
import { addDrawable } from 'drawables';

export function initGrid() {
  addDrawable('grid', (context, { x1, y1, x2, y2 }) => {
    context.beginPath();
    for (let x = floorToBlock(x1); x < x2; x += blockSize) {
      context.moveTo(x, y1);
      context.lineTo(x, y2);
    }
    for (let y = floorToBlock(y1); y < y2; y += blockSize) {
      context.moveTo(x1, y);
      context.lineTo(x2, y);
    }
    context.lineWidth = 1;
    context.strokeStyle = `${colors.white}3`;
    context.stroke();
  });
}
