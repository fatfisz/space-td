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

  distance(point: Point) {
    return ((this.x - point.x) ** 2 + (this.y - point.y) ** 2) ** 0.5;
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
