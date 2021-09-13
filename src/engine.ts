import { initAsteroids, resetAsteroids, updateAsteroids } from 'asteroids';
import { initBackground, updateBackground } from 'background';
import { colors } from 'colors';
import { initDisplay, resetDisplay, updateDisplay } from 'display';
import { initGround, resetGround } from 'ground';
import { initGui, updateGui } from 'gui';
import { initObjects, resetObjects, updateObjects } from 'objects';
import { initParticles, resetParticles, updateParticles } from 'particles';
import { initStartingScreen } from 'startingScreen';

type State = 'init' | 'play' | 'end';

let state: State = 'init';

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
  document.body.style.background = colors.blue;

  initGui();
  initBackground();
  initDisplay();
  initStartingScreen();
  initAsteroids();
  initObjects();
  initGround();
  initParticles();
}

export function engineTick() {
  updateBackground();
  updateDisplay();
  updateGui();

  if (state === 'play' || state === 'end') {
    updateParticles();
    updateAsteroids();
    updateObjects();
  }
}

export function changeEngineState(nextState: State) {
  state = nextState;
  if (state === 'init') {
    window.main.style.background = '';
    window.main.style.pointerEvents = '';
  }
  if (state === 'play') {
    window.game.style.opacity = '';
    window.game.style.pointerEvents = '';
    window.main.style.opacity = '0';
    setTimeout(() => {
      window.main.style.background = colors.white;
      window.main.style.pointerEvents = 'none';
    }, 2000);

    resetDisplay();
    resetAsteroids();
    resetObjects();
    resetGround();
    resetParticles();
  }
  if (state === 'end') {
    window.game.style.opacity = '0';
    window.game.style.pointerEvents = 'none';
    window.main.style.opacity = '';
    setTimeout(() => {
      changeEngineState('init');
    }, 2000);
  }
}
