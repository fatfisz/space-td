import type { GUI } from 'dat.gui';

let gui: GUI | undefined;

export function updateGui(): void {
  useGui((gui) => {
    gui.updateDisplay();
  });
}

export function useGui(callback: (gui: GUI) => void) {
  if (process.env.NODE_ENV !== 'production') {
    if (!gui) {
      import('dat.gui')
        .then(({ GUI }) => {
          gui = new GUI();
          gui.close();
          return gui;
        })
        .then(callback);
    } else {
      callback(gui);
    }
  }
}
