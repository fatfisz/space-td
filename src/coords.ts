import { blockSize } from 'config';

export function toBlock(coord: number) {
  return Math.floor(coord / blockSize);
}

export function toHash(x: number, y: number) {
  return `${x},${y}`;
}

export function fromHash(hash: string) {
  return hash.split(',').map((part) => +part) as [x: number, y: number];
}
