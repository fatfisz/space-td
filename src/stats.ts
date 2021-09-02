// @ts-ignore: The built version has no default export and doesn't work with Rollup
import Stats from 'stats.js/src/Stats';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let stats: any;

export function initStats() {
  if (process.env.NODE_ENV !== 'production') {
    const style = document.createElement('style');
    style.textContent = `
      .stats canvas {
        image-rendering: unset;
        left: unset;
        max-height: unset;
        max-width: unset;
        position: unset;
        top: unset;
        transform: unset;
      }
    `;
    document.head.append(style);

    stats = new Stats();
    stats.showPanel(0);

    const wrapper = document.createElement('div');
    wrapper.classList.add('stats');
    wrapper.appendChild(stats.dom);
    document.body.appendChild(wrapper);
  }
}

export function beginStats() {
  if (process.env.NODE_ENV !== 'production') {
    stats.begin();
  }
}

export function endStats() {
  if (process.env.NODE_ENV !== 'production') {
    stats.end();
  }
}
