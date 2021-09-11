import { colors } from 'colors';
import {
  displayHeight,
  displayWidth,
  menuHeight,
  menuLabelHeight,
  menuOptionHeight,
  menuOptionWidth,
  padding,
  verticalTextOffset,
} from 'config';
import { getActiveBuildableObjectName, setActiveBuildableObject } from 'objects';
import { buildableObjects } from 'objectTypes';
import { Point } from 'point';

const menuTop = displayHeight - menuHeight;
const menuButtonTop = menuTop + menuLabelHeight;
const menus = {
  build: getMenu(
    Object.values(buildableObjects),
    (context, { left, active }, { name, draw, width }) => {
      context.font = '12px monospace';
      context.fillStyle = active ? colors.black : colors.white;
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(
        name,
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
};
const activeMenu: keyof typeof menus = 'build';

export function drawMenu(context: CanvasRenderingContext2D, menuItemIndex: number | undefined) {
  context.fillStyle = colors.grey700;
  context.fillRect(0, menuTop, displayWidth, menuHeight);

  context.strokeStyle = colors.white;
  context.strokeRect(-1, menuTop + 0.5, displayWidth + 2, menuLabelHeight - 1);

  context.fillStyle = colors.white;
  context.font = '12px monospace';
  context.textAlign = 'left';
  context.textBaseline = 'middle';
  context.fillText(activeMenu, padding, menuTop + 0.5 + menuLabelHeight / 2 + verticalTextOffset);

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
  if (
    typeof menuItemIndex !== 'undefined' &&
    menuItemIndex >= 0 &&
    menuItemIndex < menus[activeMenu].options.length
  ) {
    menus[activeMenu].optionClick(menus[activeMenu].options[menuItemIndex]);
  }
}

function getMenu<Option>(
  options: Option[],
  drawOption: (
    context: CanvasRenderingContext2D,
    params: { left: number; active: boolean; hover: boolean },
    option: Option,
  ) => void,
  optionClick: (option: Option) => void,
  getActiveOption?: () => Option | undefined,
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
