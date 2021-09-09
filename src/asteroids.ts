import { colors } from 'colors';
import { minVisibleY } from 'config';
import { addDrawable, removeDrawable } from 'drawables';
import { randomBetween } from 'math';
import { getObjectsRangeWithOffset } from 'objects';

interface Asteroid {
  mass: number;
  x: number;
  y: number;
  r: number;
  dx: number;
  dy: number;
  dr: number;
  drawableHandle: number;
}

const minMass = 1;
const maxMass = 4;
const maxAngle = Math.PI / 6;
const minSpeed = 3;
const maxSpeed = 5;
const spawnY = minVisibleY - 100;
const maxRotation = 0.0001;
const asteroidChance = 0.1;
const asteroids = new Set<Asteroid>();

export function updateAsteroids() {
  maybeAddAsteroid();

  for (const asteroid of asteroids) {
    asteroid.x += asteroid.dx;
    asteroid.y += asteroid.dy;
    asteroid.r += asteroid.dr;
    maybeDeleteAsteroid(asteroid);
  }
}

function maybeAddAsteroid() {
  if (Math.random() > asteroidChance) {
    return;
  }
  const angle = randomBetween(-maxAngle, maxAngle);
  const speed = randomBetween(minSpeed, maxSpeed);
  const asteroid = {
    mass: randomBetween(minMass, maxMass),
    x: randomBetween(...getObjectsRangeWithOffset()) + Math.tan(angle) * spawnY,
    y: spawnY,
    r: 0,
    dr: randomBetween(-maxRotation, maxRotation),
    dx: Math.sin(angle) * speed,
    dy: Math.cos(angle) * speed,
    drawableHandle: addDrawable('objects', (context) => {
      context.strokeStyle = colors.white;
      context.beginPath();
      context.arc(asteroid.x, asteroid.y, 4 * 2 ** asteroid.mass, 0, Math.PI * 2);
      context.stroke();
    }),
  };
  asteroids.add(asteroid);
}

function maybeDeleteAsteroid(asteroid: Asteroid) {
  if (asteroid.y < 0) {
    return;
  }
  asteroids.delete(asteroid);
  removeDrawable(asteroid.drawableHandle);
}
