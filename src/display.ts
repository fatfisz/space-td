import { getCanvas } from 'canvas';
import { colors } from 'colors';
import {
  blockSize,
  displayHeight,
  displayWidth,
  dragThreshold,
  maxZoom,
  menuHeight,
  minZoom,
  zoomStep,
} from 'config';
import { drawDrawables } from 'drawables';
import { useGuiFolder } from 'gui';
import { drawMenu, getMenuItemFromMouse, MenuItem, menuItemClick } from 'menu';
import { GameObject, getObjectFromCanvas, objectClick } from 'objects';
import { Point } from 'point';

const [canvas, context] = getCanvas(displayWidth, displayHeight);
canvas.style.background = colors.black;

let cameraPosition = new Point(blockSize / 2, -displayHeight / 5);
let cameraZoom = 1;

let mousePosition = Point.empty;
let canvasPosition = Point.empty;
let menuItem: MenuItem | undefined = undefined;
let mouseDownPosition = Point.empty;
let canvasAtMouseDownPosition = Point.empty;
let objectAtMouseDown: GameObject | undefined = undefined;
let menuItemAtMouseDown: MenuItem | undefined = undefined;
let dragging = false;

export function initDisplay() {
  initGui();
  document.body.append(canvas);
  initMouse();
}

export function updateDisplay() {
  resetTransform();
  clearCanvas();
  setTransform();
  drawDrawables(context, {
    x: canvasPosition.x,
    y: canvasPosition.y,
    x1: cameraPosition.x - (displayWidth / 2 + 1) / cameraZoom,
    y1: cameraPosition.y - (displayHeight / 2 + 1) / cameraZoom,
    x2: cameraPosition.x + (displayWidth / 2 + 1) / cameraZoom,
    y2: cameraPosition.y + (displayHeight / 2 - menuHeight + 1) / cameraZoom,
  });
  resetTransform();
  drawMenu(context, menuItem);
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
  document.addEventListener('mousemove', (event) => {
    updateMouseFromEvent(event);
    if (!dragging && mouseDownPosition.distance(mousePosition) > dragThreshold) {
      dragging = true;
    }
    if (dragging) {
      cameraPosition = cameraFromCanvas(canvasAtMouseDownPosition);
    }
  });

  canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });

  canvas.addEventListener('wheel', (event) => {
    updateMouseFromEvent(event);
    if (!menuItem) {
      updateZoomFromEvent(event);
    }
  });

  canvas.addEventListener('mousedown', (event) => {
    event.preventDefault();
    updateMouseFromEvent(event);
    if (menuItem) {
      menuItemAtMouseDown = menuItem;
    } else {
      initMouseDown();
    }
  });

  document.addEventListener('mouseup', (event) => {
    updateMouseFromEvent(event);
    if (menuItem && menuItem === menuItemAtMouseDown) {
      menuItemClick(menuItem);
    }
    if (
      !dragging &&
      objectAtMouseDown &&
      objectAtMouseDown === getObjectFromCanvas(canvasPosition)
    ) {
      objectClick(objectAtMouseDown);
    }
    clearMouseDown();
  });

  document.addEventListener('visibilitychange', () => {
    clearMouse();
    clearMouseDown();
  });
}

function updateMouseFromEvent({ clientX, clientY } = { clientX: NaN, clientY: NaN }) {
  const rect = canvas.getBoundingClientRect();
  mousePosition = new Point(
    (clientX - rect.left) * (displayWidth / rect.width),
    (clientY - rect.top) * (displayHeight / rect.height),
  );
  canvasPosition = mousePosition
    .sub(new Point(displayWidth / 2, displayHeight / 2))
    .mul(1 / cameraZoom)
    .add(cameraPosition);
  menuItem = getMenuItemFromMouse(mousePosition);
}

function updateZoomFromEvent({ deltaY }: { deltaY: number }) {
  cameraZoom = Math.max(minZoom, Math.min(maxZoom, cameraZoom - Math.sign(deltaY) * zoomStep));
  cameraPosition = cameraFromCanvas(canvasPosition);
  // Adjust so that the transform is always an integer
  cameraPosition = new Point(
    Math.round(cameraPosition.x * cameraZoom) / cameraZoom,
    Math.round(cameraPosition.y * cameraZoom) / cameraZoom,
  );
}

function cameraFromCanvas(canvasPosition: Point) {
  return canvasPosition.sub(
    mousePosition.sub(new Point(displayWidth / 2, displayHeight / 2)).mul(1 / cameraZoom),
  );
}

function initMouseDown() {
  mouseDownPosition = mousePosition;
  canvasAtMouseDownPosition = canvasPosition;
  objectAtMouseDown = getObjectFromCanvas(canvasPosition);
}

function clearMouse() {
  mousePosition = Point.empty;
  canvasPosition = Point.empty;
  menuItem = undefined;
}

function clearMouseDown() {
  mouseDownPosition = Point.empty;
  canvasAtMouseDownPosition = Point.empty;
  objectAtMouseDown = undefined;
  menuItemAtMouseDown = undefined;
  dragging = false;
}

function clearCanvas() {
  context.clearRect(0, 0, displayWidth, displayHeight);
}

function resetTransform() {
  context.resetTransform();
}

function setTransform() {
  context.translate(displayWidth / 2, displayHeight / 2);
  context.scale(cameraZoom, cameraZoom);
  context.translate(-cameraPosition.x, -cameraPosition.y);
}
