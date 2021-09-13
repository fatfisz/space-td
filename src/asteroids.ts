import { colors } from 'colors';
import { blockSize, minVisibleY } from 'config';
import { addDrawable, removeDrawable } from 'drawables';
import { randomBetween } from 'math';
import { getCollidingObject, getMaxObjectsRange } from 'objects';
import { addParticles } from 'particles';
import { Point } from 'point';
import { initStatusBars } from 'statusBars';

export interface Asteroid {
  mass: number;
  radius: number;
  angle: number;
  speed: number;
  mid: Point;
  dMid: Point;
  r: number;
  dr: number;
  health: number;
  maxHealth: number;
  drawableHandle: number;
  vertexOffsets: number[];
  computedVertices: Point[];
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
  colors.grey100,
  colors.grey200,
  colors.grey300,
  colors.grey400,
  colors.grey500,
  colors.grey600,
];

export function initAsteroids() {
  initStatusBars(
    colors.green,
    () => asteroids,
    ({ radius, mid, health, maxHealth }) => ({
      mid,
      offsetY: -radius,
      width: 2 * radius,
      value: health / maxHealth,
    }),
  );
}

export function updateAsteroids() {
  maybeAddAsteroid();

  for (const asteroid of asteroids) {
    if (asteroid.health <= 0) {
      destroyAsteroid(asteroid);
      continue;
    }
    asteroid.mid = asteroid.mid.add(asteroid.dMid);
    asteroid.r += asteroid.dr;
    computeAsteroidVertices(asteroid);
    checkAsteroidForCollisions(asteroid);
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
  mid = new Point(randomBetween(...getMaxObjectsRange()) + Math.tan(angle) * spawnY, spawnY),
) {
  const asteroid = {
    mass,
    radius: (blockSize * mass) / 2,
    angle,
    speed,
    mid,
    dMid: new Point(Math.sin(angle), Math.cos(angle)).mul(speed),
    r: 0,
    dr: (Math.sign(Math.random() - 0.5) * randomBetween(minRotation, maxRotation)) / mass,
    health: 2 ** mass,
    maxHealth: 2 ** mass,
    drawableHandle: addDrawable('objects', (context, { x1, y1, width, height }) => {
      if (
        !asteroid.mid.within(
          x1 - asteroid.radius,
          y1 - asteroid.radius,
          width + asteroid.radius * 2,
          height + asteroid.radius * 2,
        )
      ) {
        return;
      }

      context.fillStyle = colors.grey500;
      context.strokeStyle = colors.grey300;
      context.beginPath();
      let first = true;
      for (const { x, y } of asteroid.computedVertices) {
        if (first) {
          first = false;
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
    computedVertices: [],
  };
  computeAsteroidVertices(asteroid);
  asteroids.add(asteroid);
}

function destroyAsteroid(asteroid: Asteroid) {
  deleteAsteroid(asteroid);
  addParticles(asteroid.mid, asteroid.radius, particleColors);
  if (asteroid.mass === 1) {
    return;
  }
  const angle = asteroid.angle;
  addAsteroid(asteroid.mass - 1, angle - Math.PI / 12, asteroid.speed, asteroid.mid);
  addAsteroid(asteroid.mass - 1, angle + Math.PI / 12, asteroid.speed, asteroid.mid);
}

function computeAsteroidVertices(asteroid: Asteroid) {
  asteroid.computedVertices = asteroid.vertexOffsets.map((offset, index, { length }) => {
    const angle = asteroid.r + Math.PI * 2 * (index / length);
    return new Point(
      asteroid.mid.x + Math.sin(angle) * offset * asteroid.radius,
      asteroid.mid.y + Math.cos(angle) * offset * asteroid.radius,
    );
  });
}

function checkAsteroidForCollisions(asteroid: Asteroid) {
  const collidingObject = getCollidingObject(asteroid.computedVertices);
  if (collidingObject) {
    collidingObject.health -=
      getAsteroidDamage(asteroid) * getDamageReduction(collidingObject.armor);
    destroyAsteroid(asteroid);
    return;
  }
  if (asteroid.computedVertices.some(({ y }) => y > 0)) {
    destroyAsteroid(asteroid);
  }
}

function deleteAsteroid(asteroid: Asteroid) {
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

export function getNearestAsteroids(point: Point, count: number, maxDistance: number) {
  const nearestAsteroids: [distance: number, asteroid: Asteroid][] = [];
  for (const asteroid of asteroids) {
    const distance = asteroid.mid.distance(point);
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

function getAsteroidDamage(asteroid: Asteroid) {
  const alpha = asteroid.health / asteroid.maxHealth;
  return asteroid.mass ** 2 * alpha + (asteroid.mass - 1) ** 2 * (1 - alpha);
}

function getDamageReduction(armor: number) {
  return 1 - (armor - 1) * 0.25;
}
