import { colors } from 'colors';
import { blockSize } from 'config';
import { addDrawable } from 'drawables';

export function initGrid() {
  addDrawable('grid', (context, { x, y, x1, y1, x2, y2 }) => {
    if (!isNaN(x) && !isNaN(y)) {
      context.fillStyle = `${colors.white}3`;
      context.fillRect(toBlock(x), toBlock(y), blockSize, blockSize);
    }

    context.beginPath();
    for (let x = toBlock(x1); x < x2; x += blockSize) {
      context.moveTo(x, y1);
      context.lineTo(x, y2);
    }
    for (let y = toBlock(y1); y < y2; y += blockSize) {
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

function toBlock(coord: number, offset = 0) {
  return (Math.floor(coord / blockSize) + offset) * blockSize;
}
