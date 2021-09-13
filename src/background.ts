import { getCanvas } from 'canvas';
import { colors } from 'colors';
import { displayHeight, displayWidth } from 'config';
import { fps, globalFrame } from 'frame';
import { randomBetween } from 'math';
import { Point } from 'point';

interface Star {
  mid: Point;
  cycleOffset: number;
  cycleLength: number;
}

const [canvas, context] = getCanvas(displayWidth, displayHeight);
canvas.style.background = colors.black;

const stars: Star[] = [];
const size = 3;
const starCount = 200;
const maxRadius = new Point(0, 0).distance(new Point(displayWidth / 2, displayHeight));

export function initBackground() {
  document.body.append(canvas);
  for (let index = 0; index < starCount; index += 1) {
    const angle = randomBetween(0, Math.PI * 2);
    const radius = randomBetween(0, maxRadius ** 2) ** 0.5;
    const cycleLength = Math.round(randomBetween(5 * fps, 10 * fps));
    stars.push({
      mid: new Point(Math.sin(angle) * radius, Math.cos(angle) * radius),
      cycleOffset: Math.floor(randomBetween(0, cycleLength)),
      cycleLength,
    });
  }
}

export function updateBackground() {
  const angle = (globalFrame * Math.PI * 2) / (300 * fps);

  context.clearRect(0, 0, displayWidth, displayHeight);
  context.fillStyle = colors.white;
  for (const star of stars) {
    const mid = new Point(
      star.mid.x * Math.cos(angle) - star.mid.y * Math.sin(angle) + displayWidth / 2,
      star.mid.y * Math.cos(angle) + star.mid.x * Math.sin(angle) + displayHeight,
    );
    if (!mid.within(0, 0, displayWidth, displayHeight)) {
      continue;
    }
    const opacity = Math.floor(
      ((Math.sin(((star.cycleOffset + globalFrame) / star.cycleLength) * Math.PI * 2) + 1) / 2) *
        16,
    );
    context.fillStyle = `${colors.white}${opacity.toString(16)}`;
    context.fillRect(mid.x - size / 2, mid.y - size / 2, size, size);
  }
}
