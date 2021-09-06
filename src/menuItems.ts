import { getCanvas } from 'canvas';
import { colors } from 'colors';
import { displayWidth, menuTop, padding, tabHeight } from 'config';
import { getActiveObject } from 'objects';

export type TabName = 'build' | 'info';

export type MenuItem = { type: 'tab'; name: TabName } | { type: 'menu' };

export const menuBackground = { type: 'menu' } as const;

export const tabs = {
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

export const tabNames = Object.keys(tabs) as TabName[];

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
