import { getCanvas } from 'canvas';
import { colors } from 'colors';
import { displayHeight, displayWidth, dragThreshold, maxZoom, minZoom, zoomStep } from 'config';
import { drawDrawables } from 'drawables';
import { useGuiFolder } from 'gui';
import { Point } from 'point';

const [canvas, context] = getCanvas(displayWidth, displayHeight, true);
canvas.style.background = colors.black;

let cameraPosition = Point.zero;
let cameraZoom = 1;

let mousePosition = Point.empty;
let canvasPosition = Point.empty;
let mouseDownPosition = Point.empty;
let canvasAtMouseDownPosition = Point.empty;
let dragging = false;

const midCanvas = new Point(displayWidth / 2, displayHeight / 2);

export function initDisplay() {
  initGui();
  document.body.append(canvas);
  initMouse();
}

export function updateDisplay() {
  clearCanvas();
  drawDrawables(context);
}

function initGui() {
  useGuiFolder({
    name: 'display',
    props: {
      zoom: () => cameraZoom,
      camera: () => `[${cameraPosition.x.toFixed(1)}, ${cameraPosition.y.toFixed(1)}]`,
      mouse: () => `[${mousePosition.x.toFixed(1)}, ${mousePosition.y.toFixed(1)}]`,
      canvas: () => `[${canvasPosition.x.toFixed(1)}, ${canvasPosition.y.toFixed(1)}]`,
      mouseDown: () => `[${mouseDownPosition.x.toFixed(1)}, ${mouseDownPosition.y.toFixed(1)}]`,
    },
    actions: {
      reset: () => {
        cameraPosition = Point.zero;
        cameraZoom = 1;
      },
    },
  });
}

function initMouse() {
  canvas.addEventListener('mousemove', updateMouseFromEvent);

  document.addEventListener('mousemove', (event) => {
    if (mouseDownPosition.empty()) {
      return;
    }
    updateMouseFromEvent(event);
    if (!dragging && mouseDownPosition.distance(mousePosition) > dragThreshold) {
      dragging = true;
    }
    if (dragging) {
      cameraPosition = cameraFromCanvas(canvasAtMouseDownPosition);
      updateMouseFromEvent(event);
    }
  });

  canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });

  canvas.addEventListener('wheel', (event) => {
    cameraZoom = Math.max(
      minZoom,
      Math.min(maxZoom, cameraZoom - Math.sign(event.deltaY) * zoomStep),
    );
    cameraPosition = cameraFromCanvas(canvasPosition);
  });

  canvas.addEventListener('mouseout', () => {
    if (!dragging) {
      updateMouseFromEvent();
    }
  });

  canvas.addEventListener('mousedown', (event) => {
    event.preventDefault();
    updateMouseFromEvent(event);
    mouseDownPosition = mousePosition;
    canvasAtMouseDownPosition = canvasPosition;
  });

  canvas.addEventListener('mouseup', updateMouseFromEvent);

  document.addEventListener('mouseup', () => {
    if (
      !mousePosition.empty() &&
      (mousePosition.x < 0 ||
        mousePosition.y < 0 ||
        mousePosition.x > displayWidth ||
        mousePosition.y > displayHeight)
    ) {
      updateMouseFromEvent();
    }
    mouseDownPosition = Point.empty;
    canvasAtMouseDownPosition = Point.empty;
    dragging = false;
  });

  document.addEventListener('visibilitychange', () => {
    updateMouseFromEvent();
    mouseDownPosition = Point.empty;
    canvasAtMouseDownPosition = Point.empty;
    dragging = false;
  });
}

function updateMouseFromEvent(event = { clientX: NaN, clientY: NaN }) {
  const rect = canvas.getBoundingClientRect();
  mousePosition = new Point(
    (event.clientX - rect.left) * (displayWidth / rect.width),
    (event.clientY - rect.top) * (displayHeight / rect.height),
  );
  canvasPosition = mousePosition
    .sub(midCanvas)
    .mul(1 / cameraZoom)
    .add(cameraPosition);
}

function cameraFromCanvas(canvasPosition: Point) {
  return canvasPosition.sub(mousePosition.sub(midCanvas).mul(1 / cameraZoom));
}

function clearCanvas() {
  context.resetTransform();
  context.clearRect(0, 0, displayWidth, displayHeight);
  context.translate(displayWidth / 2, displayHeight / 2);
  context.scale(cameraZoom, cameraZoom);
  context.translate(-cameraPosition.x, -cameraPosition.y);
}
