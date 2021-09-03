import { blockSize } from 'config';

export function toBlock(coord: number) {
  return Math.floor(coord / blockSize);
}

export function floorToBlock(coord: number, offset = 0) {
  return (toBlock(coord) + offset) * blockSize;
}
