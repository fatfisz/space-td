import { engineInit } from 'engine';

document.title = 'space-td';

engineInit();
// runAnimationFrame(0);

// function runAnimationFrame(time: number): void {
//   requestAnimationFrame(runAnimationFrame);

//   if (time >= lastFrameTime + frameDuration) {
//     lastFrameTime = time;
//     goToNextFrame();
//     engineTick();
//   }
// }
