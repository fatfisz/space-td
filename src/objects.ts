import { getNearestAsteroids } from 'asteroids';
import { colors } from 'colors';
import { baseBlockX, baseSize, blockSize, maxOffsetX } from 'config';
import { toBlock } from 'coords';
import { addDrawable } from 'drawables';
import {
  BatteryObject,
  BuildableObject,
  BuildableObjectName,
  buildableObjects,
  drawHover,
  ForegroundObject,
  foregroundObjects,
  SolarObject,
  TurretObject,
} from 'objectTypes';
import { addParticles } from 'particles';
import { Point } from 'point';
import { initStatusBars } from 'statusBars';

const objects = new Map<number, ForegroundObject>([
  [baseBlockX, foregroundObjects.base.get(baseBlockX)],
]);
const particleColors = [
  colors.orange200,
  colors.orange300,
  colors.orange400,
  colors.orange500,
  colors.orange600,
  colors.yellow,
];
const solars = new Set<SolarObject>();
const batteries = new Set<BatteryObject>();
const turrets = new Set<TurretObject>();
const sun = 1;
const solarEnergyMultiplier = 10;
const batteryEnergyMultiplier = 100000;
const turretEnergyMultiplier = 15;
const rangeToDistanceMultiplier = 200;
const powerToDamageMultiplier = 0.02;
let minBlockX = baseBlockX;
let maxBlockX = baseBlockX + 2;
let activeObjectBlockX: number | undefined;
let activeBuildableObjectName: BuildableObjectName | undefined;
let turretEnergyFactor = 1;

export function initObjects() {
  addDrawable('objects', (context, { position, x1, x2 }) => {
    const blockX1 = toBlock(x1);
    const blockX2 = toBlock(x2);
    for (let blockX = blockX1; blockX <= blockX2; blockX += blockX === baseBlockX ? baseSize : 1) {
      const object = objects.get(blockX);
      if (!object) {
        if (activeBuildableObjectName) {
          drawBuiltObject(context, blockX, position);
        }
        continue;
      }
      const topLeft = new Point(blockX * blockSize, -object.height);
      if (object.health <= 0) {
        context.globalAlpha = 0.5;
      }
      object.draw(context, topLeft);
      if (object.health <= 0) {
        context.globalAlpha = 1;
      }

      const mouseContainedInObject = position.within(
        topLeft.x,
        topLeft.y,
        object.width,
        object.height,
      );
      if (blockX === activeObjectBlockX || mouseContainedInObject) {
        drawHover(context, topLeft, object);
      }
    }
  });

  addDrawable('backgroundObjects', (context) => {
    const opacity = Math.max(
      Math.floor(turretEnergyFactor * 15),
      solars.size === 0 ? 0 : 8,
    ).toString(16);
    context.strokeStyle = `${colors.red}${opacity}`;
    for (const object of objects.values()) {
      if (object.name !== 'turret') {
        continue;
      }
      context.lineWidth = object.power / 2;
      context.beginPath();
      for (const target of object.targets) {
        context.moveTo(object.mid.x, object.mid.y);
        context.lineTo(target.mid.x, target.mid.y);
      }
      context.stroke();
    }
    context.lineWidth = 1;
  });

  initStatusBars(
    colors.green,
    () => objects.values(),
    ({ mid, width, height, health, maxHealth }) => ({
      mid,
      width: width - 2,
      offsetY: -height / 2 - 4,
      value: health / maxHealth,
    }),
  );

  initStatusBars(
    colors.blue,
    () => batteries,
    ({ mid, width, height, energy, storage }) => ({
      mid,
      width: width - 2,
      offsetY: -height / 2 - 1,
      value: energy / storage,
    }),
  );
}

export function updateObjects() {
  for (const [blockX, object] of objects.entries()) {
    if (object.health <= 0) {
      destroyObject(blockX, object);
    }
  }

  let availableSolarEnergy = 0;
  for (const { efficiency } of solars) {
    availableSolarEnergy += efficiency * solarEnergyMultiplier * sun;
  }

  let availableBatteryEnergy = 0;
  for (const { energy } of batteries) {
    availableBatteryEnergy += energy * batteryEnergyMultiplier;
  }

  let requiredEnergy = 0;
  for (const turret of turrets) {
    const { mid, count, range, power } = turret;
    turret.targets = getNearestAsteroids(mid, count, range * rangeToDistanceMultiplier);
    requiredEnergy +=
      turret.targets.length * levelToPower(count) * levelToPower(power) * turretEnergyMultiplier;
    requiredEnergy += 1;
  }

  const usedEnergy = Math.min(requiredEnergy, availableSolarEnergy + availableBatteryEnergy);
  turretEnergyFactor = usedEnergy / requiredEnergy;

  for (const turret of turrets) {
    const { targets, power } = turret;
    for (const target of targets) {
      target.health -= power * powerToDamageMultiplier * turretEnergyFactor;
    }
  }

  // Batteries are sorted by energy descending because of the logic
  let batteryDiffEnergy = (availableSolarEnergy - usedEnergy) / batteryEnergyMultiplier;
  if (batteryDiffEnergy > 0) {
    const sortedBatteries = [...batteries];
    for (let index = 0; index < sortedBatteries.length; index += 1) {
      const battery = sortedBatteries[index];
      const replenishedEnergy = Math.min(
        batteryDiffEnergy / (sortedBatteries.length - index),
        battery.storage - battery.energy,
      );
      battery.energy += replenishedEnergy;
      batteryDiffEnergy -= replenishedEnergy;
    }
  } else if (batteryDiffEnergy < 0) {
    const sortedBatteries = [...batteries].reverse();
    for (let index = 0; index < sortedBatteries.length; index += 1) {
      const battery = sortedBatteries[index];
      const drainedEnergy = Math.max(
        batteryDiffEnergy / (sortedBatteries.length - index),
        -battery.energy,
      );
      battery.energy += drainedEnergy;
      batteryDiffEnergy -= drainedEnergy;
    }
  }
}

function drawBuiltObject(context: CanvasRenderingContext2D, blockX: number, position: Point) {
  const goodPlacement = position.within(blockX * blockSize, -blockSize, blockSize, blockSize);
  context.strokeStyle = goodPlacement ? colors.white : `${colors.white}8`;
  context.beginPath();
  context.arc((blockX + 0.5) * blockSize, -0.5 * blockSize, blockSize / 3, 0, 2 * Math.PI);
  context.moveTo((blockX + 0.3) * blockSize, -0.5 * blockSize);
  context.lineTo((blockX + 0.7) * blockSize, -0.5 * blockSize);
  context.moveTo((blockX + 0.5) * blockSize, -0.3 * blockSize);
  context.lineTo((blockX + 0.5) * blockSize, -0.7 * blockSize);
  context.stroke();
}

export function getObjectBlockXFromCanvas({ x, y }: Point): number | undefined {
  const blockX = getNormalizedBlock(toBlock(x));
  const object = objects.get(blockX);
  const buildingPseudoObjectHeight = activeBuildableObjectName ? blockSize : -1;
  const height = object?.height ?? buildingPseudoObjectHeight;
  if (y <= 0 && y >= -height) {
    return blockX;
  }
}

export function objectClick(blockX: number | undefined) {
  if (typeof blockX === 'undefined') {
    activeObjectBlockX = undefined;
    activeBuildableObjectName = undefined;
  } else if (objects.has(blockX)) {
    activeObjectBlockX = blockX;
    activeBuildableObjectName = undefined;
  } else if (activeBuildableObjectName) {
    addObject(blockX, activeBuildableObjectName);
  }
}

function addObject(blockX: number, buildableObjectName: BuildableObjectName) {
  minBlockX = Math.min(blockX, minBlockX);
  maxBlockX = Math.max(blockX, maxBlockX);
  const object = buildableObjects[buildableObjectName].get(blockX);
  objects.set(blockX, object);

  if (object.name === 'solar') {
    solars.add(object);
  } else if (object.name === 'battery') {
    batteries.add(object);
  } else if (object.name === 'turret') {
    turrets.add(object);
  }
}

function destroyObject(blockX: number, object: ForegroundObject) {
  if (blockX === baseBlockX) {
    // TODO: end game
  }
  addParticles(object.mid, object.height / 2, particleColors, true);
  objects.delete(blockX);
  if (activeObjectBlockX === blockX) {
    activeObjectBlockX = undefined;
  }

  if (object.name === 'solar') {
    solars.delete(object);
  } else if (object.name === 'battery') {
    batteries.delete(object);
  } else if (object.name === 'turret') {
    turrets.delete(object);
  }
}

export function getActiveObject() {
  return typeof activeObjectBlockX !== 'undefined'
    ? (objects.get(activeObjectBlockX) as BuildableObject)
    : undefined;
}

export function getActiveBuildableObjectName() {
  return activeBuildableObjectName;
}

export function setActiveBuildableObject(buildableObjectName: BuildableObjectName) {
  activeBuildableObjectName = buildableObjectName;
}

export function getObjectsRangeWithOffset(): [min: number, max: number] {
  return [minBlockX * blockSize - maxOffsetX, (maxBlockX + 1) * blockSize - 1 + maxOffsetX];
}

export function getCollidingObject(points: Point[]) {
  for (const point of points) {
    const blockX = getNormalizedBlock(toBlock(point.x));
    const object = objects.get(blockX);
    if (object && point.y <= 0 && point.y >= -object.height) {
      return object;
    }
  }
}

function getNormalizedBlock(blockX: number) {
  return blockX > baseBlockX && blockX < baseBlockX + baseSize ? baseBlockX : blockX;
}

function levelToPower(level: number) {
  return 1 + Math.round(Math.log(level) * 10) / 10;
}
