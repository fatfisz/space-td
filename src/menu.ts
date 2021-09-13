import { colors } from 'colors';
import {
  blockSize,
  displayHeight,
  displayWidth,
  labelHeight,
  menuHeight,
  menuOptionHeight,
  menuOptionWidth,
  padding,
  statsHeight,
  verticalTextOffset,
} from 'config';
import { changeEngineState } from 'engine';
import {
  getActiveBuildableObjectName,
  getActiveObject,
  getStats,
  objectClick,
  setActiveBuildableObject,
} from 'objects';
import { buildableObjects, ForegroundObjectUpgrades, maxUpgrade } from 'objectTypes';
import { Point } from 'point';

const launchItemIndex = -1;
const backgroundItemIndex = -2;
const statWidth = (displayWidth - padding) / 4 - padding;
const statMid = padding + labelHeight / 2 + verticalTextOffset;
const menuTop = displayHeight - menuHeight;
const menuButtonTop = menuTop + labelHeight;

const menus = {
  build: getMenu(
    Object.values(buildableObjects),
    (context, { left, active }, { name, width, draw }) => {
      context.font = '12px monospace';
      context.fillStyle = active ? colors.black : colors.white;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(
        capitalize(name),
        left + menuOptionWidth / 2,
        menuButtonTop + labelHeight / 2 + verticalTextOffset,
      );

      draw(context, new Point(left + (menuOptionWidth - width) / 2, menuButtonTop + labelHeight));
    },
    ({ name }) => {
      setActiveBuildableObject(name);
    },
    () => {
      const activeBuildableObjectName = getActiveBuildableObjectName();
      return activeBuildableObjectName && buildableObjects[activeBuildableObjectName];
    },
  ),
  'upgrade base': getUpgradeMenu<'base'>(['armor']),
  'upgrade solar panel': getUpgradeMenu<'solar panel'>(['efficiency', 'armor']),
  'upgrade battery': getUpgradeMenu<'battery'>(['storage', 'armor']),
  'upgrade turret': getUpgradeMenu<'turret'>(['power', 'range', 'count', 'armor']),
};

export function drawMenu(context: CanvasRenderingContext2D, menuItemIndex: number | undefined) {
  const stats = getStats();
  const activeMenu = getActiveMenu();

  // Stats
  context.fillStyle = colors.grey700;
  context.fillRect(0, 0, displayWidth, statsHeight);

  context.strokeStyle = colors.white;
  context.beginPath();
  context.moveTo(0, statsHeight - 0.5);
  context.lineTo(displayWidth, statsHeight - 0.5);
  context.stroke();

  context.fillStyle = `${colors.green}4`;
  context.fillRect(padding, padding, statWidth, labelHeight);
  context.fillStyle = colors.green;
  context.fillRect(padding, padding, statWidth * stats.energy, labelHeight);
  context.strokeRect(padding + 0.5, padding + 0.5, statWidth - 1, labelHeight - 1);

  context.fillStyle = `${colors.blue}4`;
  context.fillRect(2 * padding + statWidth, padding, statWidth, labelHeight);
  context.fillStyle = colors.blue;
  context.fillRect(2 * padding + statWidth, padding, statWidth * stats.battery, labelHeight);
  context.strokeRect(2 * padding + statWidth + 0.5, padding + 0.5, statWidth - 1, labelHeight - 1);

  context.fillStyle = menuItemIndex === launchItemIndex ? `${colors.white}4` : colors.grey700;
  context.fillRect(4 * padding + 3 * statWidth, padding, statWidth, labelHeight);
  context.strokeRect(
    4 * padding + 3 * statWidth + 0.5,
    padding + 0.5,
    statWidth - 1,
    labelHeight - 1,
  );

  context.fillStyle = colors.white;
  context.font = '12px monospace';
  context.textAlign = 'left';
  context.textBaseline = 'middle';
  context.fillText('Energy', 2 * padding, statMid);
  context.fillText('Battery', 3 * padding + statWidth, statMid);
  context.fillText(`Resources: ${stats.resources}`, 3 * padding + 2 * statWidth, statMid);

  context.textAlign = 'center';
  context.fillText(`Launch!`, 4 * padding + 3.5 * statWidth, statMid);

  // Menu
  context.fillStyle = colors.grey700;
  context.fillRect(0, menuTop, displayWidth, menuHeight);

  context.strokeStyle = colors.white;
  context.strokeRect(-1, menuTop + 0.5, displayWidth + 2, labelHeight - 1);

  context.fillStyle = colors.white;
  context.font = '12px monospace';
  context.textAlign = 'left';
  context.textBaseline = 'middle';
  context.fillText(
    capitalize(activeMenu),
    padding,
    menuTop + 0.5 + labelHeight / 2 + verticalTextOffset,
  );

  menus[activeMenu].draw(context, menuItemIndex);
}

export function getMenuItemFromMouse(point: Point) {
  if (point.y < menuTop && point.y > statsHeight) {
    return;
  }
  if (point.within(4 * padding + 3 * statWidth, padding, statWidth, labelHeight)) {
    return launchItemIndex;
  }
  for (let index = 0; index < displayWidth / (menuOptionWidth + padding); index += 1) {
    if (point.within(menuOptionWidth * index, menuButtonTop, menuOptionWidth, menuOptionHeight)) {
      return index;
    }
  }
  return backgroundItemIndex;
}

export function menuItemClick(menuItemIndex: number | undefined) {
  if (menuItemIndex === launchItemIndex) {
    changeEngineState('end');
    return;
  }
  const activeMenu = getActiveMenu();
  if (getActiveMenu() === 'build') {
    objectClick(undefined);
  }
  if (
    typeof menuItemIndex !== 'undefined' &&
    menuItemIndex >= 0 &&
    menuItemIndex < menus[activeMenu].options.length
  ) {
    menus[activeMenu].optionClick(menus[activeMenu].options[menuItemIndex] as never);
  }
}

function getActiveMenu(): keyof typeof menus {
  const activeObjectName = getActiveObject()?.name;
  return activeObjectName ? `upgrade ${activeObjectName}` : 'build';
}

function getMenu<Options extends unknown[]>(
  options: Options,
  drawOption: (
    context: CanvasRenderingContext2D,
    params: { left: number; active: boolean; hover: boolean },
    option: Options[number],
  ) => void,
  optionClick: (option: Options[number]) => void,
  getActiveOption?: () => Options[number] | undefined,
) {
  return {
    options,
    draw: (context: CanvasRenderingContext2D, menuItemIndex: number | undefined) => {
      for (const [index, option] of options.entries()) {
        const left = menuOptionWidth * index;
        const active = getActiveOption?.() === option;
        const hover = index === menuItemIndex;

        context.fillStyle = active ? colors.white : hover ? `${colors.white}4` : colors.grey700;
        context.fillRect(left, menuButtonTop, menuOptionWidth, menuOptionHeight);

        context.strokeStyle = colors.white;
        context.beginPath();
        context.moveTo(left + menuOptionWidth - 0.5, menuButtonTop);
        context.lineTo(left + menuOptionWidth - 0.5, displayHeight);
        context.stroke();

        drawOption(context, { left, active, hover }, option);
      }
    },
    optionClick,
  };
}

function getUpgradeMenu<Name extends keyof ForegroundObjectUpgrades>(
  upgrades: ForegroundObjectUpgrades[Name],
) {
  return getMenu(
    upgrades,
    (context, { left, active }, name) => {
      context.font = '12px monospace';
      context.fillStyle = active ? colors.black : colors.white;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(
        capitalize(name),
        left + menuOptionWidth / 2,
        menuButtonTop + labelHeight / 2 + verticalTextOffset,
      );

      const value = getActiveObject()![name as never];
      context.fillText(
        value === maxUpgrade ? `Maxed (${value})` : `${value} 🠖 ${value + 1}`,
        left + menuOptionWidth / 2,
        menuButtonTop + labelHeight + blockSize / 2 + verticalTextOffset,
      );
    },
    (name) => {
      getActiveObject()!.upgrade(name as never);
    },
  );
}

function capitalize(text: string) {
  return text.replace(
    /(^| )([a-z])/g,
    (all, whitespace, char) => `${whitespace}${char.toUpperCase()}`,
  );
}
