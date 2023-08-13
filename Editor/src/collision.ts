export class CollisionBox {
  x: number;
  y: number;
  width: number;
  height: number;
  meta: string;

  constructor(x: number, y: number, width: number, height: number, meta: string) {
    this.reset(x, y, width, height);
    this.meta = meta;
  }

  collisionBoxesIntersect(box: CollisionBox): boolean {
    return (
      this.x < box.x + box.width &&
      this.x + this.width > box.x &&
      this.y < box.y + box.height &&
      this.y + this.height > box.y
    );
  }

  reset(x: number, y: number, width: number, height: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}
