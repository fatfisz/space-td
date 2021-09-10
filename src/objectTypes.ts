import { Asteroid, getNearestAsteroids } from 'asteroids';
import { colors } from 'colors';
import { blockSize, verticalTextOffset } from 'config';
import { fps, globalFrame } from 'frame';
import { Point } from 'point';

type BaseObjectName = 'base';

type MainObjectName = 'solar' | 'battery' | 'turret';

export type ForegroundObjectName = BaseObjectName | MainObjectName;

interface ForegroundObjectState {
  base: Record<string, unknown>;
  solar: Record<string, unknown>;
  battery: {
    energyLevel: number;
  };
  turret: {
    mid: Point;
    count: number;
    range: number;
    power: number;
    targets: Asteroid[];
  };
}

type ForegroundObjectWithState<Name extends ForegroundObjectName> = {
  name: Name;
  draw: (context: CanvasRenderingContext2D, { x, y }: Point) => void;
  reduceState: (
    state: ForegroundObjectState[Name],
    context: unknown,
  ) => Partial<ForegroundObjectState[Name]>;
  midX: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
} & ForegroundObjectState[Name];

export type ForegroundObject =
  | ForegroundObjectWithState<'base'>
  | ForegroundObjectWithState<'solar'>
  | ForegroundObjectWithState<'battery'>
  | ForegroundObjectWithState<'turret'>;

export type BuildableObjectName = keyof typeof buildableObjects;

const rangeToDistanceMultiplier = 200;
const powerToDamageMultiplier = 0.02;

const baseObjectGetter = getForegroundObjectGetter(
  'base',
  10,
  (context, { x, y }) => {
    context.font = '60px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('🗼', x + 1.5 * blockSize, y + 1.5 * blockSize + verticalTextOffset * 3);
  },
  () => ({}),
  () => ({}),
  {
    width: 3 * blockSize,
    height: 3 * blockSize,
  },
);

export const mainObjects = {
  solar: getForegroundObjectGetter(
    'solar',
    2,
    (context, { x, y }) => {
      context.font = '20px monospace';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('🌞', x + 0.5 * blockSize, y + 0.5 * blockSize + verticalTextOffset);
    },
    () => ({}),
    () => ({}),
  ),
  battery: getForegroundObjectGetter(
    'battery',
    4,
    (context, { x, y }) => {
      context.font = '20px monospace';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('🔋', x + 0.5 * blockSize, y + 0.5 * blockSize + verticalTextOffset);
    },
    () => ({ energyLevel: 0 }),
    () => ({}),
  ),
  turret: getForegroundObjectGetter(
    'turret',
    6,
    (context, { x, y }) => {
      context.font = '20px monospace';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('🔫', x + 0.5 * blockSize, y + 0.5 * blockSize + verticalTextOffset);
    },
    (blockX) => ({
      mid: new Point((blockX + 0.5) * blockSize, -blockSize / 2),
      count: 1,
      range: 1,
      power: 1,
      targets: [],
    }),
    ({ mid, count, range, power }) => {
      const targets = getNearestAsteroids(mid, count, range * rangeToDistanceMultiplier);
      for (const target of targets) {
        target.health -= power * powerToDamageMultiplier;
      }
      return { targets };
    },
  ),
} as const;

export const foregroundObjects = {
  base: baseObjectGetter,
  ...mainObjects,
};

export const buildableObjects = { ...mainObjects };

export function drawHover(
  context: CanvasRenderingContext2D,
  { x, y }: Point,
  { width, height }: { width: number; height: number },
) {
  context.strokeStyle = colors.white;
  context.setLineDash([5, 5]);
  context.lineDashOffset = Math.floor((globalFrame / fps) * -20);
  context.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);
  context.setLineDash([]);
}

function getForegroundObjectGetter<Name extends ForegroundObjectName>(
  name: Name,
  maxHealth: number,
  draw: (context: CanvasRenderingContext2D, { x, y }: Point) => void,
  getInitialState: (blockX: number) => ForegroundObjectState[Name],
  reduceState: (
    state: ForegroundObjectState[Name],
    context: unknown,
  ) => Partial<ForegroundObjectState[Name]>,
  extra?: Partial<ForegroundObjectWithState<Name>>,
) {
  const statics = {
    name,
    draw,
    width: blockSize,
    height: blockSize,
    health: maxHealth,
    maxHealth,
    ...extra,
  };
  return {
    get: (blockX: number) => ({
      reduceState,
      midX: blockX * blockSize + statics.width / 2,
      ...statics,
      ...getInitialState(blockX),
    }),
    ...statics,
  };
}
