import { baseBlockX, baseBlockY, blockSize } from 'config';
import { fromHash, toBlock, toHash } from 'coords';
import { addDrawable } from 'drawables';
import { Point } from 'point';

const dugOut = new Set<string>([`${baseBlockX + 1},0`]);
const digging = new Set<string>();

export function initGround() {
  addDrawable('ground', (context, { x1, y1, x2, y2 }) => {
    const blockX1 = toBlock(x1);
    const blockY1 = Math.max(toBlock(y1), 0);
    const blockX2 = toBlock(x2);
    const blockY2 = toBlock(y2);
    context.fillStyle = 'sienna';

    for (let blockY = blockY1; blockY <= blockY2; blockY += 1) {
      for (let blockX = blockX1; blockX <= blockX2; blockX += 1) {
        const hash = toHash(blockX, blockY);
        if (dugOut.has(hash) || digging.has(hash)) {
          continue;
        }
        context.fillRect(blockX * blockSize, blockY * blockSize, blockSize, blockSize);
      }
    }
  });
}

export function startDigging(hash: string) {
  digging.add(hash);
}

export function digOut(hash: string) {
  digging.delete(hash);
  dugOut.add(hash);
}

export function getBuildableGroundBlocks() {
  if (dugOut.size === 1) {
    return [];
  }
  return [...dugOut]
    .filter((hash) => {
      const [x, y] = fromHash(hash);
      return !dugOut.has(toHash(x, y + 1));
    })
    .map((hash) => new Point(...fromHash(hash)));
}

export function getDuggableBlocks() {
  const duggableBlocks = new Set<string>();
  for (const hash of dugOut) {
    const [blockX, blockY] = fromHash(hash);
    addIfPossible(duggableBlocks, blockX - 1, blockY);
    addIfPossible(duggableBlocks, blockX + 1, blockY);
    addIfPossible(duggableBlocks, blockX, blockY - 1);
    addIfPossible(duggableBlocks, blockX, blockY + 1);
  }
  return [...duggableBlocks].map((hash) => new Point(...fromHash(hash)));
}

function addIfPossible(duggableBlocks: Set<string>, blockX: number, blockY: number) {
  if (blockY <= baseBlockY + 1) {
    return;
  }
  const hash = toHash(blockX, blockY);
  if (!dugOut.has(hash) && !duggableBlocks.has(hash)) {
    duggableBlocks.add(hash);
  }
}
