import { CompoundZIndex, Point } from "./point.ts";

export class PointStack {
  stack: Map<string, Point> = new Map();
  highestPoint?: Point;
  constructor(
    private onHighestPointChanged: (point: Point) => void,
    private onEmpty: () => void
  ) {}

  private setHighestPoint(point: Point) {
    this.highestPoint = point;
    this.onHighestPointChanged(point);
  }

  set(point: Point) {
    this.stack.set(point.zIndex.stringRepresentation, point);
    if (
      !this.highestPoint ||
      this.highestPoint.zIndex.stringRepresentation ===
        point.zIndex.stringRepresentation ||
      this.highestPoint.zIndex.isLessThan(point.zIndex)
    ) {
      this.setHighestPoint(point);
    }
  }

  get(zIndex: CompoundZIndex) {
    return this.stack.get(zIndex.stringRepresentation);
  }

  clear(zIndex: CompoundZIndex) {
    this.stack.delete(zIndex.stringRepresentation);
    if (
      zIndex.stringRepresentation ===
      this.highestPoint?.zIndex.stringRepresentation
    ) {
      let newHighestPoint: Point | undefined;
      for (const point of this.stack.values()) {
        if (
          !newHighestPoint ||
          point.zIndex.isGreaterThan(newHighestPoint.zIndex)
        ) {
          newHighestPoint = point;
        }
      }
      if (newHighestPoint) {
        this.setHighestPoint(newHighestPoint);
      } else {
        this.onEmpty();
      }
    }
  }
}
