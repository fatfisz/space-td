import { engineTick, initEngine } from 'engine';
import { frameDuration, goToNextFrame } from 'frame';
import { beginStats, endStats, initStats } from 'stats';

document.title = 'space-td';

let lastFrameTime = 0;

initStats();
initEngine();
runAnimationFrame(0);

function runAnimationFrame(time: number) {
  requestAnimationFrame(runAnimationFrame);

  beginStats();
  if (time >= lastFrameTime + frameDuration) {
    lastFrameTime = time;
    goToNextFrame();
    engineTick();
  }
  endStats();
}
