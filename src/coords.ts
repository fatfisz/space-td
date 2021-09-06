import { blockSize } from 'config';

export function toBlock(coord: number) {
  return Math.floor(coord / blockSize);
}
