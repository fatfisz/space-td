import { colors } from 'colors';
import { blockSize } from 'config';
import { addDrawable } from 'drawables';

export function initGrid() {
  addDrawable('grid', (context, x1, y1, x2, y2) => {
    context.beginPath();
    for (let x = Math.floor(x1 / blockSize) * blockSize; x < x2; x += blockSize) {
      context.moveTo(x, y1);
      context.lineTo(x, y2);
    }
    for (let y = Math.floor(y1 / blockSize) * blockSize; y < y2; y += blockSize) {
      context.moveTo(x1, y);
      context.lineTo(x2, y);
    }
    context.lineWidth = 1;
    context.strokeStyle = colors.white;
    context.stroke();

    context.beginPath();
    context.fillStyle = colors.white;
    context.arc(0, 0, 3, 0, 2 * Math.PI);
    context.fill();
  });
}
