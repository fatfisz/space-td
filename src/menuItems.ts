import { getCanvas } from 'canvas';
import { colors } from 'colors';
import {
  displayWidth,
  menuLabelHeight,
  menuOptionHeight,
  menuOptionWidth,
  menuTop,
  padding,
  verticalTextOffset,
} from 'config';
import { getActiveBuildableObjectName, getActiveObject } from 'objects';
import { BuildableObjectName, buildableObjects } from 'objectTypes';
import { Point } from 'point';

export type TabName = 'build' | 'info';

interface MenuBackgroundItem {
  type: 'menu';
}
interface MenuTabItem {
  type: 'tab';
  name: TabName;
}
interface MenuBuildObjectItem {
  type: 'menuBuildObject';
  name: BuildableObjectName;
}
export type MenuItem = MenuBackgroundItem | MenuTabItem | MenuBuildObjectItem;

type Draw = (context: CanvasRenderingContext2D, menuItem?: MenuItem | undefined) => void;

export const menuBackground: MenuBackgroundItem = { type: 'menu' };

const buildableObjectEntries = Object.entries(buildableObjects) as [
  BuildableObjectName,
  typeof buildableObjects[BuildableObjectName],
][];
const buildableObjectItem = Object.fromEntries(
  buildableObjectEntries.map(([name]) => [name, getBuildableObjectItem(name)]),
) as Record<BuildableObjectName, MenuBuildObjectItem>;

const top = menuTop + menuLabelHeight + padding + 0.5;

export const tabs = {
  build: getTab('build', (context, menuItem) => {
    for (const [index, [name, { draw, width }]] of buildableObjectEntries.entries()) {
      const left = padding + (menuOptionWidth + padding) * index + 0.5;
      const active = name === getActiveBuildableObjectName();
      const hover = menuItem?.type === 'menuBuildObject' && menuItem.name === name;

      context.fillStyle = active ? colors.white : hover ? `${colors.white}4` : colors.black;
      context.fillRect(left, top, menuOptionWidth, menuOptionHeight);

      context.strokeStyle = colors.white;
      context.strokeRect(left, top, menuOptionWidth, menuOptionHeight);

      context.fillStyle = active ? colors.black : colors.white;
      context.font = '12px monospace';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText(
        name,
        left + menuOptionWidth / 2,
        top + menuLabelHeight / 2 + verticalTextOffset,
      );

      draw(context, new Point(left + (menuOptionWidth - width) / 2, top + menuLabelHeight));
    }
  }),
  info: getTab('info', (context) => {
    const activeObject = getActiveObject();
    context.font = '12px monospace';
    context.textAlign = 'left';
    context.textBaseline = 'top';
    context.fillStyle = colors.white;
    context.fillText(
      activeObject ? `Selected object: ${activeObject}` : 'select an object to see more details',
      padding,
      menuTop + menuLabelHeight + padding,
      displayWidth - 2 * padding,
    );
  }),
};

export const tabNames = Object.keys(tabs) as TabName[];

export function getMenuTabFromMouse(point: Point) {
  let tabOffset = 0;
  for (const tabName of tabNames) {
    if (point.within(tabOffset, menuTop, tabs[tabName].width, menuLabelHeight)) {
      return tabs[tabName].menuItem;
    }
    tabOffset += tabs[tabName].width;
  }
}

export function getMenuObjectFromMouse(tabName: TabName, point: Point) {
  if (tabName === 'build') {
    for (const [index, [name]] of buildableObjectEntries.entries()) {
      if (
        point.within(
          padding + (menuOptionWidth + padding) * index + 0.5,
          top,
          menuOptionWidth,
          menuOptionHeight,
        )
      ) {
        return buildableObjectItem[name];
      }
    }
  }
}

function getTab(
  tabName: TabName,
  draw: Draw,
): { draw: Draw; menuItem: MenuTabItem; width: number } {
  const [, context] = getCanvas(1000, 1000);
  context.font = '12px monospace';
  const width = Math.round(context.measureText(tabName).width) + padding * 2 - 1;
  return {
    draw,
    menuItem: { type: 'tab', name: tabName },
    width,
  };
}

function getBuildableObjectItem(name: BuildableObjectName): MenuBuildObjectItem {
  return { type: 'menuBuildObject', name };
}
