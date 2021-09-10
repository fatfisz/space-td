import { colors } from 'colors';
import { blockSize, minVisibleY } from 'config';
import { addDrawable, removeDrawable } from 'drawables';
import { initHealthBars } from 'healthBars';
import { randomBetween } from 'math';
import { getObjectsRangeWithOffset } from 'objects';
import { addParticles } from 'particles';
import { Point } from 'point';

export interface Asteroid {
  mass: number;
  angle: number;
  speed: number;
  position: Point;
  dPosition: Point;
  r: number;
  dr: number;
  health: number;
  maxHealth: number;
  drawableHandle: number;
  vertexOffsets: number[];
}

const maxAsteroids = 80;
const minMass = 1;
const maxMass = 4;
const maxAngle = Math.PI / 6;
const minSpeed = 0.5;
const maxSpeed = 1.5;
const spawnY = minVisibleY - 100;
const minRotation = 0.01;
const maxRotation = 0.04;
const asteroidChance = 0.05;
const asteroids = new Set<Asteroid>();
const particleColors = [
  colors.grey200,
  colors.grey300,
  colors.grey400,
  colors.grey500,
  colors.grey600,
];

export function initAsteroids() {
  initHealthBars(
    () => asteroids,
    ({ mass, position }) => {
      const radius = getAsteroidRadius(mass);
      return {
        midX: position.x,
        y: position.y - radius,
        width: 2 * radius,
      };
    },
  );
}

export function updateAsteroids() {
  maybeAddAsteroid();

  for (const asteroid of asteroids) {
    if (asteroid.health <= 0) {
      destroyAsteroid(asteroid);
      continue;
    }
    asteroid.position = asteroid.position.add(asteroid.dPosition);
    asteroid.r += asteroid.dr;
    maybeDestroyAsteroid(asteroid);
  }
}

function maybeAddAsteroid() {
  if (Math.random() > asteroidChance || asteroids.size >= maxAsteroids) {
    return;
  }
  addAsteroid();
}

function addAsteroid(
  mass = Math.floor(randomBetween(minMass, maxMass + 1)),
  angle = randomBetween(-maxAngle, maxAngle),
  speed = randomBetween(minSpeed, maxSpeed) / mass,
  position = new Point(
    randomBetween(...getObjectsRangeWithOffset()) + Math.tan(angle) * spawnY,
    spawnY,
  ),
) {
  const radius = getAsteroidRadius(mass);
  const asteroid = {
    mass,
    angle,
    speed,
    position,
    dPosition: new Point(Math.sin(angle), Math.cos(angle)).mul(speed),
    r: 0,
    dr: (Math.sign(Math.random() - 0.5) * randomBetween(minRotation, maxRotation)) / mass,
    health: 2 ** mass,
    maxHealth: 2 ** mass,
    drawableHandle: addDrawable('objects', (context, { x1, y1, width, height }) => {
      if (
        !asteroid.position.within(x1 - radius, y1 - radius, width + radius * 2, height + radius * 2)
      ) {
        return;
      }

      context.fillStyle = colors.grey500;
      context.strokeStyle = colors.grey300;
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

function destroyAsteroid(asteroid: Asteroid) {
  deleteAsteroid(asteroid);
  addParticles(asteroid.position, getAsteroidRadius(asteroid.mass), particleColors);
  if (asteroid.mass === 1) {
    return;
  }
  const angle = asteroid.angle;
  addAsteroid(
    asteroid.mass - 1,
    angle - Math.PI / 12,
    (asteroid.speed * asteroid.mass) / (asteroid.mass - 1),
    asteroid.position,
  );
  addAsteroid(
    asteroid.mass - 1,
    angle + Math.PI / 12,
    (asteroid.speed * asteroid.mass) / (asteroid.mass - 1),
    asteroid.position,
  );
}

function maybeDestroyAsteroid(asteroid: Asteroid) {
  if (asteroid.position.y < 0) {
    return;
  }
  destroyAsteroid(asteroid);
}

function deleteAsteroid(asteroid: Asteroid) {
  asteroids.delete(asteroid);
  removeDrawable(asteroid.drawableHandle);
}

function getAsteroidRadius(mass: number) {
  return (blockSize * mass) / 2;
}

function getAsteroidVertexOffsets(mass: number) {
  const vertexCount = Math.round(mass) * 2 + 3;
  const offsets = [];
  for (let index = 0; index < vertexCount; index += 1) {
    offsets.push(randomBetween(0.5, 1));
  }
  return offsets;
}

export function getNearestAsteroids(point: Point, count: number, maxDistance: number) {
  const nearestAsteroids: [distance: number, asteroid: Asteroid][] = [];
  for (const asteroid of asteroids) {
    const distance = asteroid.position.distance(point);
    if (distance > maxDistance) {
      continue;
    }
    const index = nearestAsteroids.findIndex(([prevDistance]) => distance < prevDistance);
    if (index >= 0) {
      nearestAsteroids.splice(index, 0, [distance, asteroid]);
      if (nearestAsteroids.length > count) {
        nearestAsteroids.pop();
      }
    } else if (nearestAsteroids.length < count) {
      nearestAsteroids.push([distance, asteroid]);
    }
  }
  return nearestAsteroids.map(([, asteroid]) => asteroid);
}
