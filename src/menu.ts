import { getCanvas } from 'canvas';
import { colors } from 'colors';
import { displaySize, lineHeightOffset, menuHeight } from 'config';
import { Point } from 'point';

type TabName = keyof typeof tabs;

export type MenuItem = { type: 'tab'; name: TabName } | { type: 'menu' };

const tabs = {
  build: {
    width: 0,
  },
  info: {
    width: 0,
  },
};

const tabNames = Object.keys(tabs) as TabName[];

const menuTop = displaySize - menuHeight;
const padding = 8;
const tabHeight = 20;

let activeTabName: TabName = 'build';

export function initMenu() {
  const [, context] = getCanvas(1000, 1000);
  context.font = '12px monospace';
  for (const tabName of tabNames) {
    tabs[tabName].width = Math.round(context.measureText(tabName).width) + padding * 2 - 1;
  }
}

export function drawMenu(context: CanvasRenderingContext2D, menuItem: MenuItem | undefined) {
  context.strokeStyle = 'white';
  context.strokeRect(0.5, menuTop + 0.5, displaySize - 1, menuHeight - 1);

  drawTabs(context, menuItem);
}

export function getMenuItemFromMouse({ x, y }: Point): MenuItem | undefined {
  if (y < displaySize - menuHeight) {
    return;
  }

  let tabOffset = 0;
  for (const tabName of tabNames) {
    if (
      x > tabOffset &&
      x < tabOffset + tabs[tabName].width &&
      y < displaySize - menuHeight + tabHeight
    ) {
      return menuItems.tab[tabName];
    }
    tabOffset += tabs[tabName].width;
  }
  return menuItems.menu;
}

export function menuItemClick(menuItem: MenuItem) {
  if (menuItem.type === 'tab') {
    activeTabName = menuItem.name;
  }
}

const menuItems = {
  tab: {
    build: { type: 'tab', name: 'build' },
    info: { type: 'tab', name: 'info' },
  },
  menu: { type: 'menu' },
} as const;

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
  if (active) {
    return colors.white;
  }
  if (hover) {
    return `${colors.white}3`;
  }
  return colors.black;
}
