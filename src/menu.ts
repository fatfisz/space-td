import { getCanvas } from 'canvas';
import { colors } from 'colors';
import {
  displayHeight,
  displayWidth,
  lineHeightOffset,
  menuHeight,
  padding,
  tabHeight,
} from 'config';
import { getActiveObject } from 'objects';
import { Point } from 'point';

type TabName = 'build' | 'info';

export type MenuItem = { type: 'tab'; name: TabName } | { type: 'menu' };

const baseMenuItem = { type: 'menu' } as const;
const menuTop = displayHeight - menuHeight;
let activeTabName: TabName = 'build';

const tabs = {
  build: initTab('build', (context) => {}),
  info: initTab('info', (context) => {
    const activeObject = getActiveObject();
    context.font = '12px monospace';
    context.textAlign = 'left';
    context.textBaseline = 'top';
    context.fillStyle = colors.white;
    context.fillText(
      `Selected object: ${activeObject.type}`,
      padding,
      menuTop + tabHeight + padding,
      displayWidth - 2 * padding,
    );
  }),
};
const tabNames = Object.keys(tabs) as TabName[];

export function drawMenu(context: CanvasRenderingContext2D, menuItem: MenuItem | undefined) {
  context.fillStyle = colors.black;
  context.fillRect(0, menuTop, displayWidth, menuHeight);
  context.strokeStyle = 'white';
  context.strokeRect(0.5, menuTop + 0.5, displayWidth - 1, menuHeight - 1);

  drawTabs(context, menuItem);
  tabs[activeTabName].draw(context);
}

export function getMenuItemFromMouse({ x, y }: Point): MenuItem | undefined {
  if (y < menuTop) {
    return;
  }

  let tabOffset = 0;
  for (const tabName of tabNames) {
    if (x > tabOffset && x < tabOffset + tabs[tabName].width && y < menuTop + tabHeight) {
      return tabs[tabName].menuItem;
    }
    tabOffset += tabs[tabName].width;
  }
  return baseMenuItem;
}

export function menuItemClick(menuItem: MenuItem) {
  if (menuItem.type === 'tab') {
    activeTabName = menuItem.name;
  }
}

function drawTabs(context: CanvasRenderingContext2D, menuItem: MenuItem | undefined) {
  context.font = '12px monospace';
  context.textAlign = 'left';
  context.textBaseline = 'middle';

  let tabOffset = 0;
  for (const tabName of tabNames) {
    const active = tabName === activeTabName;
    const hover = menuItem?.type === 'tab' && menuItem.name === tabName;

    context.fillStyle = getTabFillStyle(active, hover);
    context.fillRect(tabOffset + 0.5, menuTop + 0.5, tabs[tabName].width, tabHeight);

    context.fillStyle = active ? colors.black : colors.white;
    context.fillText(
      tabName,
      tabOffset + padding,
      menuTop + 0.5 + tabHeight / 2 + lineHeightOffset,
    );

    context.strokeStyle = colors.white;
    context.strokeRect(tabOffset + 0.5, menuTop + 0.5, tabs[tabName].width, tabHeight);
    tabOffset += tabs[tabName].width;
  }
}

function getTabFillStyle(active: boolean, hover: boolean) {
  return active ? colors.white : hover ? `${colors.white}3` : colors.black;
}

function initTab(tabName: TabName, draw: (context: CanvasRenderingContext2D) => void) {
  const [, context] = getCanvas(1000, 1000);
  context.font = '12px monospace';
  const width = Math.round(context.measureText(tabName).width) + padding * 2 - 1;
  return {
    draw,
    menuItem: { type: 'tab', name: tabName },
    width,
  } as const;
}
