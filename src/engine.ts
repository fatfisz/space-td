import { useGui } from 'gui';

export function engineInit() {
  if (process.env.NODE_ENV !== 'production') {
    const style = document.createElement('style');
    style.textContent = `
      canvas {
        outline: 3px solid black;
      }

      .dg.ac {
        z-index: 1 !important;
      }
    `;
    document.head.append(style);
  }

  useGui((gui) => {
    gui.open();
  });
}
