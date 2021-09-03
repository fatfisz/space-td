import { initDisplay, updateDisplay } from 'display';
import { initGrid } from 'grid';
import { initGui, updateGui } from 'gui';
import { initObjects } from 'objects';

export function initEngine() {
  if (process.env.NODE_ENV !== 'production') {
    const style = document.createElement('style');
    style.textContent = `
      .dg.ac {
        z-index: 1 !important;
      }
    `;
    document.head.append(style);
  }

  initGui();
  initDisplay();
  initObjects();
  initGrid();
}

export function engineTick() {
  updateDisplay();
  updateGui();
}
