import { engineInit, engineTick } from 'engine';
import { frameDuration, goToNextFrame } from 'frame';

document.title = 'space-td';

let lastFrameTime = 0;
engineInit();
runAnimationFrame(0);

function runAnimationFrame(time: number) {
  requestAnimationFrame(runAnimationFrame);

  if (time >= lastFrameTime + frameDuration) {
    lastFrameTime = time;
    goToNextFrame();
    engineTick();
  }
}
