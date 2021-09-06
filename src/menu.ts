import { colors } from 'colors';
import {
  displayHeight,
  displayWidth,
  menuHeight,
  menuLabelHeight,
  padding,
  verticalTextOffset,
} from 'config';
import {
  getMenuObjectFromMouse,
  getMenuTabFromMouse,
  menuBackground,
  MenuItem,
  TabName,
  tabNames,
  tabs,
} from 'menuItems';
import { Point } from 'point';

const menuTop = displayHeight - menuHeight;
let activeTabName: TabName = 'build';

export function drawMenu(context: CanvasRenderingContext2D, menuItem: MenuItem | undefined) {
  context.fillStyle = colors.black;
  context.fillRect(0, menuTop, displayWidth, menuHeight);
  context.strokeStyle = 'white';
  context.strokeRect(0.5, menuTop + 0.5, displayWidth - 1, menuHeight - 1);

  drawTabs(context, menuItem);
  tabs[activeTabName].draw(context, menuItem);
}

export function getMenuItemFromMouse(point: Point) {
  if (point.y < menuTop) {
    return;
  }
  return (
    getMenuTabFromMouse(point) ?? getMenuObjectFromMouse(activeTabName, point) ?? menuBackground
  );
}

export function menuItemClick(menuItem: MenuItem) {
  if (menuItem.type === 'tab') {
    activeTabName = menuItem.name;
  }
  if (menuItem.type === 'menuBuildObject') {
    console.log(menuItem.name);
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

    context.fillStyle = active ? colors.white : hover ? `${colors.white}3` : colors.black;
    context.fillRect(tabOffset + 0.5, menuTop + 0.5, tabs[tabName].width, menuLabelHeight);

    context.fillStyle = active ? colors.black : colors.white;
    context.fillText(
      tabName,
      tabOffset + padding,
      menuTop + 0.5 + menuLabelHeight / 2 + verticalTextOffset,
    );

    context.strokeStyle = colors.white;
    context.strokeRect(tabOffset + 0.5, menuTop + 0.5, tabs[tabName].width, menuLabelHeight);
    tabOffset += tabs[tabName].width;
  }
}
