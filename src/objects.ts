import { getNearestAsteroids } from 'asteroids';
import { colors } from 'colors';
import { baseBlockX, baseBlockY, baseSize, blockSize, maxOffsetX } from 'config';
import { fromHash, toBlock, toHash } from 'coords';
import { addDrawable } from 'drawables';
import { changeEngineState } from 'engine';
import { digOut, getBuildableGroundBlocks, getDuggableBlocks, startDigging } from 'ground';
import {
  BatteryObject,
  BuildableObject,
  BuildableObjectName,
  buildableObjects,
  drawHover,
  DrillObject,
  drillStartingTicks,
  ForegroundObject,
  foregroundObjects,
  SolarObject,
  TurretObject,
} from 'objectTypes';
import { addParticles } from 'particles';
import { Point } from 'point';
import { initStatusBars } from 'statusBars';

const objects = new Map<string, ForegroundObject>();
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
const drills = new Set<DrillObject>();
const sun = 1;
const baseEnergy = 20;
const solarEnergyMultiplier = 10;
const batteryEnergyMultiplier = 1000;
const turretEnergyMultiplier = 15;
const drillEnergy = 5;
const rangeToDistanceMultiplier = 200;
const powerToDamageMultiplier = 0.02;
let minBlockX = baseBlockX;
let maxBlockX = baseBlockX + baseSize - 1;
let activeObjectHash: string | undefined;
let activeBuildableObjectName: BuildableObjectName | undefined;
let availableEnergyFactor = 1;

export function resetObjects() {
  objects.clear();
  objects.set(toHash(baseBlockX, baseBlockY), foregroundObjects.base.get(baseBlockX, baseBlockY));
  solars.clear();
  batteries.clear();
  turrets.clear();
  drills.clear();
}

export function initObjects() {
  addDrawable('objects', (context, { position }) => {
    for (const object of objects.values()) {
      const blockX = toBlock(object.mid.x - object.width / 2);
      const blockY = toBlock(object.mid.y - object.height / 2);
      const topLeft = new Point(blockX * blockSize, blockY * blockSize);
      object.draw(context, topLeft);

      const mouseContainedInObject = position.within(
        topLeft.x,
        topLeft.y,
        object.width,
        object.height,
      );
      if (toHash(blockX, baseBlockY) === activeObjectHash || mouseContainedInObject) {
        drawHover(context, topLeft, object);
      }
    }
  });

  addDrawable('decorative', (context, displayState) => {
    for (const block of getBuildableBlocks()) {
      drawBuildableBlock(context, block, displayState.position);
    }
  });

  addDrawable('backgroundObjects', (context) => {
    const opacity = Math.floor(availableEnergyFactor * 15);
    context.strokeStyle = `${colors.red}${opacity.toString(16)}`;
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

  initStatusBars(
    colors.red,
    () => drills,
    ({ mid, width, height, ticksLeft }) => ({
      mid,
      width: width - 2,
      offsetY: -height / 2 - 1,
      value: (drillStartingTicks - ticksLeft) / drillStartingTicks,
    }),
  );
}

export function updateObjects() {
  for (const [hash, object] of objects.entries()) {
    if (object.health <= 0) {
      destroyObject(hash, object);
    }
  }

  let availableSolarEnergy = baseEnergy;
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
  requiredEnergy += drills.size * drillEnergy;

  const usedEnergy = Math.min(requiredEnergy, availableSolarEnergy + availableBatteryEnergy);
  availableEnergyFactor = usedEnergy / requiredEnergy;

  for (const turret of turrets) {
    const { targets, power } = turret;
    for (const target of targets) {
      target.health -= power * powerToDamageMultiplier * availableEnergyFactor;
    }
  }

  for (const drill of drills) {
    drill.ticksLeft -= availableEnergyFactor;
    if (drill.ticksLeft <= 0) {
      const blockX = toBlock(drill.mid.x);
      const blockY = toBlock(drill.mid.y);
      destroyObject(toHash(blockX, blockY), drill);
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

function getBuildableBlocks() {
  if (!activeBuildableObjectName) {
    return [];
  }
  if (activeBuildableObjectName === 'drill') {
    return getDuggableBlocks().filter(
      (block) =>
        !objects.has(toHash(block.x, block.y)) && !objects.has(toHash(block.x, block.y - 1)),
    );
  }

  const [minBlockX, maxBlockX] = getMaxObjectsRange();
  const buildableBlocks = [];
  for (let blockX = minBlockX; blockX <= maxBlockX; blockX += 1) {
    if (
      (blockX < baseBlockX || blockX >= baseBlockX + baseSize) &&
      !objects.has(toHash(blockX, baseBlockY))
    ) {
      buildableBlocks.push(new Point(blockX, baseBlockY));
    }
  }

  if (activeBuildableObjectName === 'battery') {
    return [
      ...buildableBlocks,
      ...getBuildableGroundBlocks().filter((block) => !objects.has(toHash(block.x, block.y))),
    ];
  }
  return buildableBlocks;
}

function drawBuildableBlock(context: CanvasRenderingContext2D, block: Point, mousePosition: Point) {
  const hover = mousePosition.within(
    block.x * blockSize,
    block.y * blockSize,
    blockSize,
    blockSize,
  );
  context.strokeStyle = hover ? colors.white : `${colors.white}8`;
  context.beginPath();
  context.arc(
    (block.x + 0.5) * blockSize,
    (block.y + 0.5) * blockSize,
    blockSize / 3,
    0,
    Math.PI * 2,
  );
  context.moveTo((block.x + 0.3) * blockSize, (block.y + 0.5) * blockSize);
  context.lineTo((block.x + 0.7) * blockSize, (block.y + 0.5) * blockSize);
  context.moveTo((block.x + 0.5) * blockSize, (block.y + 0.3) * blockSize);
  context.lineTo((block.x + 0.5) * blockSize, (block.y + 0.7) * blockSize);
  context.stroke();
}

export function getObjectHashFromCanvas({ x, y }: Point) {
  const hash = getNormalizedBlockHash(toBlock(x), toBlock(y));
  const object = objects.get(hash);
  if (object || getBuildableBlocks().some((block) => toHash(block.x, block.y) === hash)) {
    return hash;
  }
}

export function objectClick(hash: string | undefined) {
  if (typeof hash === 'undefined') {
    activeObjectHash = undefined;
    activeBuildableObjectName = undefined;
  } else if (objects.has(hash)) {
    if (objects.get(hash)!.name !== 'drill') {
      activeObjectHash = hash;
    }
    activeBuildableObjectName = undefined;
  } else if (activeBuildableObjectName) {
    addObject(hash, activeBuildableObjectName);
  }
}

function addObject(hash: string, buildableObjectName: BuildableObjectName) {
  const [blockX, blockY] = fromHash(hash);
  minBlockX = Math.min(blockX, minBlockX);
  maxBlockX = Math.max(blockX, maxBlockX);
  const object = buildableObjects[buildableObjectName].get(blockX, blockY);
  objects.set(hash, object);

  if (object.name === 'solar panel') {
    solars.add(object);
  } else if (object.name === 'battery') {
    batteries.add(object);
  } else if (object.name === 'turret') {
    turrets.add(object);
  } else if (object.name === 'drill') {
    drills.add(object);
    startDigging(hash);
  }
}

function destroyObject(hash: string, object: ForegroundObject) {
  if (object.name === 'base') {
    changeEngineState('end');
  }
  if (object.addParticlesWhenDestructing ?? true) {
    addParticles(object.mid, object.height / 2, particleColors, true);
  }
  objects.delete(hash);
  if (activeObjectHash === hash) {
    activeObjectHash = undefined;
  }

  if (object.name === 'solar panel') {
    solars.delete(object);
  } else if (object.name === 'battery') {
    batteries.delete(object);
  } else if (object.name === 'turret') {
    turrets.delete(object);
  } else if (object.name === 'drill') {
    drills.delete(object);
    digOut(hash);
  }
}

export function getActiveObject() {
  return typeof activeObjectHash !== 'undefined'
    ? (objects.get(activeObjectHash) as Exclude<BuildableObject, DrillObject>)
    : undefined;
}

export function getActiveBuildableObjectName() {
  return activeBuildableObjectName;
}

export function setActiveBuildableObject(buildableObjectName: BuildableObjectName) {
  activeBuildableObjectName = buildableObjectName;
}

export function getMaxObjectsRange(): [min: number, max: number] {
  return [minBlockX * blockSize - maxOffsetX, (maxBlockX + 1) * blockSize - 1 + maxOffsetX];
}

export function getCollidingObject(points: Point[]) {
  for (const point of points) {
    const hash = getNormalizedBlockHash(toBlock(point.x), toBlock(point.y));
    const object = objects.get(hash);
    if (object && point.y <= 0 && point.y >= -object.height) {
      return object;
    }
  }
}

function getNormalizedBlockHash(blockX: number, blockY: number) {
  return blockX >= baseBlockX &&
    blockX < baseBlockX + baseSize &&
    blockY > baseBlockY - baseSize &&
    blockY <= baseBlockY
    ? toHash(baseBlockX, baseBlockY)
    : toHash(blockX, blockY);
}

function levelToPower(level: number) {
  return 1 + Math.round(Math.log(level) * 10) / 10;
}
