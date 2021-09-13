import { colors } from 'colors';
import {
  blockSize,
  displayHeight,
  displayWidth,
  menuHeight,
  menuLabelHeight,
  menuOptionHeight,
  menuOptionWidth,
  padding,
  verticalTextOffset,
} from 'config';
import {
  getActiveBuildableObjectName,
  getActiveObject,
  objectClick,
  setActiveBuildableObject,
} from 'objects';
import { buildableObjects, ForegroundObjectUpgrades, maxUpgrade } from 'objectTypes';
import { Point } from 'point';

const menuTop = displayHeight - menuHeight;
const menuButtonTop = menuTop + menuLabelHeight;
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
        menuButtonTop + menuLabelHeight / 2 + verticalTextOffset,
      );

      draw(
        context,
        new Point(left + (menuOptionWidth - width) / 2, menuButtonTop + menuLabelHeight),
      );
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
  const activeMenu = getActiveMenu();

  context.fillStyle = colors.grey700;
  context.fillRect(0, menuTop, displayWidth, menuHeight);

  context.strokeStyle = colors.white;
  context.strokeRect(-1, menuTop + 0.5, displayWidth + 2, menuLabelHeight - 1);

  context.fillStyle = colors.white;
  context.font = '12px monospace';
  context.textAlign = 'left';
  context.textBaseline = 'middle';
  context.fillText(
    capitalize(activeMenu),
    padding,
    menuTop + 0.5 + menuLabelHeight / 2 + verticalTextOffset,
  );

  menus[activeMenu].draw(context, menuItemIndex);
}

export function getMenuItemFromMouse(point: Point) {
  if (point.y < menuTop) {
    return;
  }
  for (let index = 0; index < displayWidth / (menuOptionWidth + padding); index += 1) {
    if (point.within(menuOptionWidth * index, menuButtonTop, menuOptionWidth, menuOptionHeight)) {
      return index;
    }
  }
  return -1;
}

export function menuItemClick(menuItemIndex: number | undefined) {
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
        menuButtonTop + menuLabelHeight / 2 + verticalTextOffset,
      );

      const value = getActiveObject()![name as never];
      context.fillText(
        value === maxUpgrade ? `Maxed (${value})` : `${value} 🠖 ${value + 1}`,
        left + menuOptionWidth / 2,
        menuButtonTop + menuLabelHeight + blockSize / 2 + verticalTextOffset,
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
