import { changeEngineState } from 'engine';

export function initStartingScreen() {
  const style = document.createElement('style');
  style.textContent = `#main{text-align:center}.margin{margin-top:10vmin}.smol{font-size:.75em}`;
  document.head.append(style);

  const main = document.createElement('div');
  main.className = 'screen';
  main.id = 'main';
  main.innerHTML =
    '<div class=margin>Asteroid Miner</div><div class=margin><button id=start>Start</button> <button id=showinfo>How to play</button></div><div class=margin id=score></div><div class="margin smol">Made by <a href=https://fatfisz.com/>FatFisz</a></div>';
  document.body.appendChild(main);

  window.start.onclick = () => {
    changeEngineState('play');
  };

  window.showinfo.onclick = () => {
    main.style.opacity = '0';
    info.style.opacity = '';
    info.style.pointerEvents = '';
  };

  const info = document.createElement('div');
  info.className = 'screen';
  info.id = 'info';
  info.innerHTML =
    "<p class=margin>Welcome to the future, where asteroid mining is booming ✨</p><p>Your job is to mine as much resources as possible without getting obliterated by smaller (yet very destructive) asteroids.</p><p>First dig using a drill, then build and upgrade (access by clicking on a building) your power supply and defences.</p><p>When you feel ready, you can launch the rocket - as long as it's not yet destroyed!</p><button id=back>Got it</button>";
  info.style.opacity = '0';
  info.style.pointerEvents = 'none';
  document.body.appendChild(info);

  window.back.onclick = () => {
    main.style.opacity = '';
    info.style.opacity = '0';
    info.style.pointerEvents = 'none';
  };

  setSizeFromCanvas();
  window.onresize = setSizeFromCanvas;

  function setSizeFromCanvas() {
    const { width, height } = window.game.getBoundingClientRect();
    main.style.width = `${width / 2}px`;
    main.style.height = `${height / 2}px`;
    info.style.width = `${width / 2}px`;
    info.style.height = `${height / 2}px`;
  }
}
