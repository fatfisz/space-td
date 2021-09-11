import { addDrawable } from 'drawables';

export function initStatusBars<StatusableObject>(
  color: string,
  getStatusables: () => Iterable<StatusableObject>,
  getStatus: (statusable: StatusableObject) => {
    value: number;
    midX: number;
    y: number;
    width: number;
  },
) {
  addDrawable('statusBars', (context) => {
    context.lineWidth = 2;
    context.strokeStyle = color;
    context.beginPath();
    for (const statusable of getStatusables()) {
      const { value, midX, y, width } = getStatus(statusable);
      if (value < 0) {
        continue;
      }
      context.moveTo(midX - width / 2, y);
      context.lineTo(midX - width / 2 + width * value, y);
    }
    context.stroke();
    context.lineWidth = 1;
  });
}
