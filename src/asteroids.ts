import { colors } from 'colors';
import { blockSize, minVisibleY } from 'config';
import { addDrawable, removeDrawable } from 'drawables';
import { randomBetween } from 'math';
import { getObjectsRangeWithOffset } from 'objects';
import { Point } from 'point';

interface Asteroid {
  mass: number;
  position: Point;
  r: number;
  dPosition: Point;
  dr: number;
  drawableHandle: number;
  vertexOffsets: number[];
}

const maxAsteroids = 80;
const minMass = 1;
const maxMass = 3;
const maxAngle = Math.PI / 6;
const minSpeed = 1;
const maxSpeed = 2;
const spawnY = minVisibleY - 100;
const minRotation = 0.01;
const maxRotation = 0.04;
const asteroidChance = 0.05;
const asteroids = new Set<Asteroid>();

export function updateAsteroids() {
  maybeAddAsteroid();

  for (const asteroid of asteroids) {
    asteroid.position = asteroid.position.add(asteroid.dPosition);
    asteroid.r += asteroid.dr;
    maybeDeleteAsteroid(asteroid);
  }
}

function maybeAddAsteroid() {
  if (Math.random() > asteroidChance || asteroids.size >= maxAsteroids) {
    return;
  }
  const mass = Math.floor(randomBetween(minMass, maxMass + 1));
  const angle = randomBetween(-maxAngle, maxAngle);
  const radius = (blockSize * mass) / 2;
  const asteroid = {
    mass,
    position: new Point(
      randomBetween(...getObjectsRangeWithOffset()) + Math.tan(angle) * spawnY,
      spawnY,
    ),
    r: 0,
    dPosition: new Point(Math.sin(angle), Math.cos(angle)).mul(
      randomBetween(minSpeed, maxSpeed) / mass,
    ),
    dr: Math.sign(Math.random() - 0.5) * randomBetween(minRotation, maxRotation),
    drawableHandle: addDrawable('objects', (context, { x1, y1, width, height }) => {
      if (
        !asteroid.position.within(x1 - radius, y1 - radius, width + radius * 2, height + radius * 2)
      ) {
        return;
      }

      context.fillStyle = colors.black;
      context.strokeStyle = colors.white;
      context.beginPath();
      for (let index = 0; index < asteroid.vertexOffsets.length; index += 1) {
        const offset = asteroid.vertexOffsets[index] * radius;
        const angle = asteroid.r + Math.PI * 2 * (index / asteroid.vertexOffsets.length);
        const x = asteroid.position.x + Math.sin(angle) * offset;
        const y = asteroid.position.y + Math.cos(angle) * offset;
        if (index === 0) {
          context.moveTo(x, y);
        } else {
          context.lineTo(x, y);
        }
      }
      context.closePath();
      context.fill();
      context.stroke();
    }),
    vertexOffsets: getAsteroidVertexOffsets(mass),
  };
  asteroids.add(asteroid);
}

function maybeDeleteAsteroid(asteroid: Asteroid) {
  if (asteroid.position.y < 0) {
    return;
  }
  asteroids.delete(asteroid);
  removeDrawable(asteroid.drawableHandle);
}

function getAsteroidVertexOffsets(mass: number) {
  const vertexCount = Math.round(mass) * 2 + 3;
  const offsets = [];
  for (let index = 0; index < vertexCount; index += 1) {
    offsets.push(randomBetween(0.5, 1));
  }
  return offsets;
}
