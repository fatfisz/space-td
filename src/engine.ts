import { initAsteroids, updateAsteroids } from 'asteroids';
import { initDisplay, updateDisplay } from 'display';
import { initGround } from 'ground';
import { initGui, updateGui } from 'gui';
import { initObjects, updateObjects } from 'objects';
import { initParticles, updateParticles } from 'particles';

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
  initAsteroids();
  initObjects();
  initGround();
  initParticles();
}

export function engineTick() {
  updateParticles();
  updateAsteroids();
  updateObjects();
  updateDisplay();
  updateGui();
}
