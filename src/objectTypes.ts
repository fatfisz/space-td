import { Asteroid } from 'asteroids';
import { colors } from 'colors';
import { blockSize, verticalTextOffset } from 'config';
import { fps, globalFrame } from 'frame';
import { Point } from 'point';

type BaseObjectName = 'base';

export type BuildableObjectName = 'solar' | 'battery' | 'turret';

export type ForegroundObjectName = BaseObjectName | BuildableObjectName;

export interface ForegroundObjectUpgrades {
  base: ['armor'];
  solar: ['efficiency', 'armor'];
  battery: ['storage', 'armor'];
  turret: ['power', 'range', 'count', 'armor'];
}

interface ForegroundObjectState {
  base: Record<string, unknown>;
  solar: Record<string, unknown>;
  battery: { energy: number };
  turret: { targets: Asteroid[] };
}

export type ForegroundObjectWithState<Name extends ForegroundObjectName> = {
  name: Name;
  mid: Point;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  draw: (context: CanvasRenderingContext2D, { x, y }: Point) => void;
  upgrade: (property: ForegroundObjectUpgrades[Name][number]) => void;
} & Record<ForegroundObjectUpgrades[Name][number], number> &
  ForegroundObjectState[Name];

type BaseObject = ForegroundObjectWithState<'base'>;

export type SolarObject = ForegroundObjectWithState<'solar'>;

export type BatteryObject = ForegroundObjectWithState<'battery'>;

export type TurretObject = ForegroundObjectWithState<'turret'>;

export type BuildableObject = SolarObject | BatteryObject | TurretObject;

export type ForegroundObject = BaseObject | BuildableObject;

export const maxUpgrade = 3;

const baseObjectGetter = getForegroundObjectGetter({
  name: 'base',
  maxHealth: 10,
  extra: {
    width: 3 * blockSize,
    height: 3 * blockSize,
  },
  upgrades: {
    armor: 1,
  },
  draw: (context, { x, y }) => {
    context.font = '60px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText('🗼', x + 1.5 * blockSize, y + 1.5 * blockSize + verticalTextOffset * 3);
  },
});

export const buildableObjects = {
  solar: getForegroundObjectGetter({
    name: 'solar',
    maxHealth: 2,
    draw: (context, { x, y }) => {
      context.font = '20px monospace';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('🌞', x + 0.5 * blockSize, y + 0.5 * blockSize + verticalTextOffset);
    },
    upgrades: {
      efficiency: 1,
      armor: 1,
    },
  }),
  battery: getForegroundObjectGetter({
    name: 'battery',
    maxHealth: 4,
    draw: (context, { x, y }) => {
      context.font = '20px monospace';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('🔋', x + 0.5 * blockSize, y + 0.5 * blockSize + verticalTextOffset);
    },
    upgrades: {
      storage: 1,
      armor: 1,
    },
    getState: () => ({ energy: 0 }),
  }),
  turret: getForegroundObjectGetter({
    name: 'turret',
    maxHealth: 6,
    draw: (context, { x, y }) => {
      context.font = '20px monospace';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('🔫', x + 0.5 * blockSize, y + 0.5 * blockSize + verticalTextOffset);
    },
    upgrades: {
      count: 1,
      range: 1,
      power: 1,
      armor: 1,
    },
    getState: () => ({ targets: [] }),
  }),
};

export const foregroundObjects = {
  base: baseObjectGetter,
  ...buildableObjects,
};

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

function getForegroundObjectGetter<Name extends ForegroundObjectName>({
  name,
  maxHealth,
  getState,
  upgrades,
  extra,
  draw,
}: {
  name: Name;
  maxHealth: number;
  getState?: (blockX: number) => ForegroundObjectState[Name];
  upgrades: Record<ForegroundObjectUpgrades[Name][number], 1>;
  extra?: Partial<ForegroundObjectWithState<Name>>;
  draw: (context: CanvasRenderingContext2D, { x, y }: Point) => void;
}): {
  get: (blockX: number) => ForegroundObjectWithState<Name>;
  name: Name;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  draw: (context: CanvasRenderingContext2D, { x, y }: Point) => void;
} {
  const statics = {
    name,
    width: blockSize,
    height: blockSize,
    health: maxHealth,
    maxHealth,
    draw,
    ...extra,
  };
  return {
    get: (blockX: number) => {
      const object = {
        mid: new Point(blockX * blockSize + statics.width / 2, -statics.height / 2),
        upgrade,
        ...upgrades,
        ...statics,
        ...getState?.(blockX),
      } as unknown as ForegroundObjectWithState<Name>;

      return object;

      function upgrade(property: ForegroundObjectUpgrades[Name][number]) {
        object[property] = Math.min(object[property] + 1, maxUpgrade) as never;
      }
    },
    ...statics,
  };
}
