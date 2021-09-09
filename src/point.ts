export class Point {
  readonly x;
  readonly y;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  add(point: Point) {
    return new Point(this.x + point.x, this.y + point.y);
  }

  mul(factor: number) {
    return new Point(this.x * factor, this.y * factor);
  }

  sub(point: Point) {
    return new Point(this.x - point.x, this.y - point.y);
  }

  round() {
    return new Point(Math.round(this.x), Math.round(this.y));
  }

  equal(point: Point | undefined) {
    return Boolean(point && this.x === point.x && this.y === point.y);
  }

  distance(point: Point) {
    return ((this.x - point.x) ** 2 + (this.y - point.y) ** 2) ** 0.5;
  }

  empty() {
    return isNaN(this.x) || isNaN(this.y);
  }

  within(x: number, y: number, width: number, height: number) {
    return this.x >= x && this.x < x + width && this.y >= y && this.y < y + height;
  }

  ensureWithin(x: number, y: number, width: number, height: number) {
    return new Point(
      Math.min(x + width, Math.max(x, this.x)),
      Math.min(y + height, Math.max(y, this.y)),
    );
  }

  static zero = new Point(0, 0);

  static empty = new Point(NaN, NaN);
}

export class HashedPoint extends Point {
  private static cache = new Map<string, HashedPoint>();

  constructor(x: number, y: number) {
    super(x, y);
    const hash = this.toHash();
    if (!HashedPoint.cache.has(hash)) {
      HashedPoint.cache.set(hash, this);
    }
    return HashedPoint.cache.get(hash)!;
  }

  private toHash() {
    return `${this.x},${this.y}`;
  }
}
