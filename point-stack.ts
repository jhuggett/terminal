import { CompoundZIndex, Point, rendering } from "./point.ts";

export class PointStack {
  // stack: Map<string, Point> = new Map();
  // highestPoint?: Point;

  stack: Point[] = [];

  get highestPoint() {
    return this.stack.length > 0
      ? this.stack[this.stack.length - 1]
      : undefined;
  }

  setInStack(point: Point) {
    const highestPoint = this.highestPoint;
    const highestPointIsTransparent =
      highestPoint &&
      (!highestPoint.backgroundColor || !highestPoint.foregroundColor);
    const previousRendering = highestPointIsTransparent
      ? rendering(highestPoint, this)
      : undefined;

    const existingPointIndex = this.stack.findIndex((p) =>
      p.zIndex.sameAs(point.zIndex)
    );
    if (existingPointIndex !== -1) {
      /*
      Point is already in stack, just update it.
      No need for sorting.
      */
      this.stack[existingPointIndex] = point;
      if (this.stack.length - 1 === existingPointIndex) {
        this.onHighestPointChanged();
      } else if (
        previousRendering &&
        !(previousRendering === rendering(this.highestPoint!, this))
      ) {
        this.onHighestPointChanged();
      }
      return;
    }
    /*
    Otherwise, this is a new point that needs to be added.
    So, add point to the bottom of the stack and then sort.
    */
    const previousHighestPoint = this.highestPoint;

    this.stack.unshift(point);
    this.stack.sort((a, b) => (a.zIndex.isGreaterThan(b.zIndex) ? 1 : -1));
    const newHighestPoint = this.highestPoint;

    if (
      !(
        previousHighestPoint &&
        newHighestPoint &&
        newHighestPoint.zIndex.sameAs(previousHighestPoint.zIndex)
      )
    ) {
      this.onHighestPointChanged();
    }
    if (
      previousRendering &&
      !(previousRendering === rendering(this.highestPoint!, this))
    ) {
      this.onHighestPointChanged();
    }
  }

  removeFromStack(zIndex: CompoundZIndex) {
    const highestPoint = this.highestPoint;
    const highestPointIsTransparent =
      highestPoint &&
      (!highestPoint.backgroundColor || !highestPoint.foregroundColor);
    const previousRendering = highestPointIsTransparent
      ? rendering(highestPoint, this)
      : undefined;

    const existingPointIndex = this.stack.findIndex((p) =>
      p.zIndex.sameAs(zIndex)
    );

    if (existingPointIndex === -1) {
      return;
    }
    this.stack.splice(existingPointIndex, 1);

    if (this.stack.length === existingPointIndex) {
      this.onHighestPointChanged();
      return;
    }
    if (this.stack.length === 0) {
      this.onEmpty();
      return;
    }
    if (
      previousRendering &&
      !(previousRendering === rendering(this.highestPoint!, this))
    ) {
      this.onHighestPointChanged();
    }
  }

  constructor(
    private onHighestPointChanged: () => void,
    private onEmpty: () => void
  ) {}

  set(point: Point) {
    this.setInStack(point);
  }

  get(zIndex: CompoundZIndex) {
    return this.stack.find((point) => point.zIndex.sameAs(zIndex));
  }

  clear(zIndex: CompoundZIndex) {
    this.removeFromStack(zIndex);
    /*
    Should we also clear all points with a 
    z-index greater than zIndex?
    */
  }
}
