type ImageCacheId = string | number | ImageCacheId[];

export function getCanvas(
  width: number,
  height: number,
  imageSmoothingEnabled = false,
): [canvas: HTMLCanvasElement, context: CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d')!;
  context.imageSmoothingEnabled = imageSmoothingEnabled;
  return [canvas, context];
}

const imageCache = new Map<string, HTMLCanvasElement>();

export function useCanvasCache(id: ImageCacheId, getImage: () => HTMLCanvasElement) {
  const stringifiedId = String(id);
  if (!imageCache.has(stringifiedId)) {
    imageCache.set(stringifiedId, getImage());
  }
  return imageCache.get(stringifiedId)!;
}
