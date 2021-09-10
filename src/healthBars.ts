import { colors } from 'colors';
import { addDrawable } from 'drawables';

interface HealthableBase {
  health: number;
  maxHealth: number;
}

export function initHealthBars<Healthable extends HealthableBase>(
  getHealthables: () => Iterable<Healthable>,
  getHealth: (healthable: Healthable) => { midX: number; y: number; width: number },
) {
  addDrawable('healthBars', (context) => {
    context.lineWidth = 2;
    context.strokeStyle = colors.green;
    context.beginPath();
    for (const healthable of getHealthables()) {
      if (healthable.health === healthable.maxHealth) {
        continue;
      }
      const { midX, y, width } = getHealth(healthable);
      context.moveTo(midX - width / 2, y);
      context.lineTo(midX - width / 2 + (width * healthable.health) / healthable.maxHealth, y);
    }
    context.stroke();
    context.lineWidth = 1;
  });
}
