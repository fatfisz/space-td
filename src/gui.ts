import type { GUI } from 'dat.gui';

declare global {
  interface Window {
    gui: Promise<GUI> | undefined;
  }
}

export function initGui(open = true) {
  useGui((gui) => {
    if (open) {
      gui.open();
    }
  });
}

export function updateGui() {
  useGui((gui) => {
    gui.updateDisplay();
  });
}

export function useGuiFolder({
  name,
  props = {},
  actions = {},
  open = false,
}: {
  name: string;
  props?: Record<string, () => unknown>;
  actions?: Record<string, () => void>;
  open?: boolean;
}) {
  useGui((gui) => {
    const folder = gui.addFolder(name);
    const state = {};
    for (const [propName, propGetter] of Object.entries(props)) {
      Object.defineProperty(state, propName, { get: propGetter });
      folder.add(state, propName);
    }
    for (const [actionName, action] of Object.entries(actions)) {
      Object.defineProperty(state, actionName, { value: action });
      folder.add(state, actionName);
    }
    if (open) {
      folder.open();
    }
  });
}

function useGui(callback: (gui: GUI) => void) {
  if (process.env.NODE_ENV !== 'production') {
    if (!window.gui) {
      window.gui = import('dat.gui').then(({ GUI }) => {
        const gui = new GUI();
        gui.close();
        return gui;
      });
    }
    window.gui.then(callback);
  }
}
