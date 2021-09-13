import { Asteroid } from 'asteroids';
import { colors } from 'colors';
import { baseSize, blockSize, upgradeCost, verticalTextOffset } from 'config';
import { fps, globalFrame } from 'frame';
import { getStats } from 'objects';
import { Point } from 'point';

type BaseObjectName = 'base';

export type BuildableObjectName = 'solar panel' | 'battery' | 'turret' | 'drill (free)';

export type ForegroundObjectName = BaseObjectName | BuildableObjectName;

export interface ForegroundObjectUpgrades {
  base: ['armor'];
  'solar panel': ['efficiency', 'armor'];
  battery: ['storage', 'armor'];
  turret: ['power', 'range', 'count', 'armor'];
  'drill (free)': [];
}

interface ForegroundObjectState {
  base: Record<string, unknown>;
  'solar panel': Record<string, unknown>;
  battery: { energy: number };
  turret: { targets: Asteroid[] };
  'drill (free)': { ticksLeft: number };
}

export type ForegroundObjectWithState<Name extends ForegroundObjectName> = {
  name: Name;
  mid: Point;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  armor: number;
  addParticlesWhenDestructing?: boolean;
  draw: (context: CanvasRenderingContext2D, point: Point) => void;
  upgrade: (property: ForegroundObjectUpgrades[Name][number]) => void;
} & Record<ForegroundObjectUpgrades[Name][number], number> &
  ForegroundObjectState[Name];

type BaseObject = ForegroundObjectWithState<'base'>;

export type SolarObject = ForegroundObjectWithState<'solar panel'>;

export type BatteryObject = ForegroundObjectWithState<'battery'>;

export type TurretObject = ForegroundObjectWithState<'turret'>;

export type DrillObject = ForegroundObjectWithState<'drill (free)'>;

export type BuildableObject = SolarObject | BatteryObject | TurretObject | DrillObject;

export type ForegroundObject = BaseObject | BuildableObject;

export const maxUpgrade = 3;

export const drillStartingTicks = fps * 2;

const baseObjectGetter = getForegroundObjectGetter({
  name: 'base',
  maxHealth: 20,
  getState: () => ({}),
  upgrades: {
    armor: 1,
  },
  extra: {
    width: baseSize * blockSize,
    height: baseSize * blockSize,
  },
  draw: (context, { x, y }) => {
    context.font = '60px monospace';
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    context.fillText(
      '🗼',
      x + (baseSize * blockSize) / 2,
      y + (baseSize * blockSize) / 2 + verticalTextOffset * baseSize,
    );
  },
});

export const buildableObjects = {
  'solar panel': getForegroundObjectGetter({
    name: 'solar panel',
    maxHealth: 2,
    getState: () => ({}),
    upgrades: {
      efficiency: 1,
      armor: 1,
    },
    draw: (context, { x, y }) => {
      context.font = '20px monospace';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('🌞', x + blockSize / 2, y + blockSize / 2 + verticalTextOffset);
    },
  }),
  battery: getForegroundObjectGetter({
    name: 'battery',
    maxHealth: 4,
    getState: () => ({ energy: 0 }),
    upgrades: {
      storage: 1,
      armor: 1,
    },
    draw: (context, { x, y }) => {
      context.font = '20px monospace';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('🔋', x + blockSize / 2, y + blockSize / 2 + verticalTextOffset);
    },
  }),
  turret: getForegroundObjectGetter({
    name: 'turret',
    maxHealth: 8,
    getState: () => ({ targets: [] }),
    upgrades: {
      count: 1,
      range: 1,
      power: 1,
      armor: 1,
    },
    draw: (context, { x, y }) => {
      context.font = '20px monospace';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('🔫', x + blockSize / 2, y + blockSize / 2 + verticalTextOffset);
    },
  }),
  'drill (free)': getForegroundObjectGetter({
    name: 'drill (free)',
    maxHealth: Infinity,
    getState: () => ({ ticksLeft: drillStartingTicks }),
    upgrades: {},
    extra: {
      addParticlesWhenDestructing: false,
    },
    draw: (context, { x, y }) => {
      context.font = '20px monospace';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('⛏️', x + blockSize / 2, y + blockSize / 2 + verticalTextOffset);
    },
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
  getState: (blockX: number, blockY: number) => ForegroundObjectState[Name];
  upgrades: Record<ForegroundObjectUpgrades[Name][number], 1>;
  extra?: Partial<ForegroundObjectWithState<Name>>;
  draw: (context: CanvasRenderingContext2D, point: Point) => void;
}): {
  get: (blockX: number, blockY: number) => ForegroundObjectWithState<Name>;
  name: Name;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  draw: (context: CanvasRenderingContext2D, point: Point) => void;
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
    get: (blockX: number, blockY: number) => {
      const object = {
        mid: new Point(
          blockX * blockSize + statics.width / 2,
          (blockY + 1) * blockSize - statics.height / 2,
        ),
        armor: Infinity,
        upgrade,
        ...upgrades,
        ...statics,
        ...getState?.(blockX, blockY),
      } as never;

      return object;

      function upgrade(property: ForegroundObjectUpgrades[Name][number]) {
        const stats = getStats();
        if (stats.resources < upgradeCost || object[property] === maxUpgrade) {
          return;
        }
        stats.resources -= upgradeCost;
        object[property] = (object[property] + 1) as never;
      }
    },
    ...statics,
  };
}
