import { defaultPixelSize } from 'config';
import { initDisplay, updateDisplay } from 'display';
import { initGui, updateGui } from 'gui';

export function engineInit() {
  if (process.env.NODE_ENV !== 'production') {
    const style = document.createElement('style');
    style.textContent = `
      canvas {
        outline: ${defaultPixelSize}px solid black;
      }

      .dg.ac {
        z-index: 1 !important;
      }
    `;
    document.head.append(style);
  }

  initGui();
  initDisplay();
}

export function engineTick() {
  updateDisplay();
  updateGui();
}
