import { addDrawable } from 'drawables';
import { Point } from 'point';

export function initStatusBars<StatusableObject>(
  color: string,
  getStatusables: () => Iterable<StatusableObject>,
  getStatus: (statusable: StatusableObject) => {
    value: number;
    mid: Point;
    offsetY: number;
    width: number;
  },
) {
  addDrawable('decorative', (context) => {
    context.lineWidth = 2;
    context.strokeStyle = color;
    context.beginPath();
    for (const statusable of getStatusables()) {
      const { value, mid, offsetY, width } = getStatus(statusable);
      if (value < 0) {
        continue;
      }
      context.moveTo(mid.x - width / 2, mid.y + offsetY);
      context.lineTo(mid.x - width / 2 + width * value, mid.y + offsetY);
    }
    context.stroke();
    context.lineWidth = 1;
  });
}
