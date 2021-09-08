import { initDisplay, updateDisplay } from 'display';
import { initGround } from 'ground';
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
  document.body.style.background = '#49f';

  initGui();
  initDisplay();
  initObjects();
  initGround();
}

export function engineTick() {
  updateDisplay();
  updateGui();
}
