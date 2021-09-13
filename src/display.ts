import { getCanvas } from 'canvas';
import {
  blockSize,
  displayHeight,
  displayWidth,
  dragThreshold,
  maxVisibleY,
  maxZoom,
  menuHeight,
  minVisibleY,
  minZoom,
  zoomStep,
} from 'config';
import { drawDrawables } from 'drawables';
import { useGuiFolder } from 'gui';
import { drawMenu, getMenuItemFromMouse, menuItemClick } from 'menu';
import { getMaxObjectsRange, getObjectHashFromCanvas, objectClick } from 'objects';
import { Point } from 'point';

const [canvas, context] = getCanvas(displayWidth, displayHeight);

let cameraPosition = new Point(blockSize / 2, -displayHeight / 5);
let cameraZoom = 1;

let mousePosition = Point.empty;
let canvasPosition = Point.empty;
let menuItemIndex: number | undefined;
let mouseDownPosition = Point.empty;
let canvasAtMouseDownPosition = Point.empty;
let objectHashAtMouseDown: string | undefined;
let dragging = false;
let menuClicked = false;

export function resetDisplay() {
  cameraPosition = new Point(blockSize / 2, -displayHeight / 5);
  cameraZoom = 1;

  mousePosition = Point.empty;
  canvasPosition = Point.empty;
  menuItemIndex = undefined;
  mouseDownPosition = Point.empty;
  canvasAtMouseDownPosition = Point.empty;
  objectHashAtMouseDown = undefined;
  dragging = false;
  menuClicked = false;
}

export function initDisplay() {
  initGui();
  canvas.id = 'game';
  canvas.style.opacity = '0';
  canvas.style.pointerEvents = 'none';
  document.body.append(canvas);
  initMouse();
}

export function updateDisplay() {
  resetTransform();
  clearCanvas();
  setTransform();
  drawDrawables(context, {
    position: canvasPosition,
    x1: cameraPosition.x - (displayWidth / 2 + 1) / cameraZoom,
    y1: cameraPosition.y - (displayHeight / 2 + 1) / cameraZoom,
    x2: cameraPosition.x + (displayWidth / 2 + 1) / cameraZoom,
    y2: cameraPosition.y + (displayHeight / 2 - menuHeight + 1) / cameraZoom,
    width: (displayWidth + 2) / cameraZoom,
    height: (displayHeight - menuHeight + 2) / cameraZoom,
  });
  resetTransform();
  drawMenu(context, menuItemIndex);
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
        cameraPosition = new Point(blockSize / 2, -displayHeight / 5);
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
      updateCameraFromCanvas(canvasAtMouseDownPosition);
    }
  });

  canvas.addEventListener('contextmenu', (event) => {
    event.preventDefault();
  });

  canvas.addEventListener('wheel', (event) => {
    updateMouseFromEvent(event);
    if (typeof menuItemIndex === 'undefined') {
      updateZoomFromEvent(event);
    }
  });

  canvas.addEventListener('mousedown', (event) => {
    event.preventDefault();
    updateMouseFromEvent(event);
    if (typeof menuItemIndex !== 'undefined') {
      menuClicked = true;
      menuItemClick(menuItemIndex);
    } else {
      initMouseDown();
    }
  });

  document.addEventListener('mouseup', (event) => {
    updateMouseFromEvent(event);
    if (
      !dragging &&
      !menuClicked &&
      objectHashAtMouseDown === getObjectHashFromCanvas(canvasPosition)
    ) {
      objectClick(objectHashAtMouseDown);
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
  menuItemIndex = getMenuItemFromMouse(mousePosition);
}

function updateZoomFromEvent({ deltaY }: { deltaY: number }) {
  cameraZoom = Math.max(minZoom, Math.min(maxZoom, cameraZoom - Math.sign(deltaY) * zoomStep));
  updateCameraFromCanvas(canvasPosition);
}

function updateCameraFromCanvas(canvasPosition: Point) {
  cameraPosition = canvasPosition.sub(
    mousePosition.sub(new Point(displayWidth / 2, displayHeight / 2)).mul(1 / cameraZoom),
  );

  // Correct for bounds
  const [minX, maxX] = getMaxObjectsRange();
  cameraPosition = cameraPosition.ensureWithin(
    minX + (displayWidth / 2 + 1) / cameraZoom,
    minVisibleY + (displayHeight / 2 + 1) / cameraZoom,
    maxX - minX - (displayWidth + 2) / cameraZoom,
    maxVisibleY - minVisibleY - (displayHeight + 2) / cameraZoom,
  );

  // Adjust so that the transform is always an integer
  cameraPosition = new Point(
    Math.round(cameraPosition.x * cameraZoom) / cameraZoom,
    Math.round(cameraPosition.y * cameraZoom) / cameraZoom,
  );
}

function initMouseDown() {
  mouseDownPosition = mousePosition;
  canvasAtMouseDownPosition = canvasPosition;
  objectHashAtMouseDown = getObjectHashFromCanvas(canvasPosition);
}

function clearMouse() {
  mousePosition = Point.empty;
  canvasPosition = Point.empty;
  menuItemIndex = undefined;
}

function clearMouseDown() {
  mouseDownPosition = Point.empty;
  canvasAtMouseDownPosition = Point.empty;
  objectHashAtMouseDown = undefined;
  dragging = false;
  menuClicked = false;
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
