import { Point } from "../points/point.ts";
import { PointStack } from "../point-stacks/point-stack.ts";
import { XY, XYMap, XYSet } from "../xy.ts";
import { Element } from "../elements/element.ts";
import { BoxBounds } from "../bounds/box-bounds.ts";

export class PointGrid {
  private pointStacks = new XYMap<PointStack>();
  private changedPoints = XYSet.empty();

  get hasChangedPoints() {
    return this.changedPoints.size > 0;
  }

  private noteChange(coordinate: XY) {
    this.changedPoints.add(coordinate);
  }

  flushChangedPoints() {
    const points = this.changedPoints.coordinates.map((coordinate) => {
      const stack = this.pointStacks.get(coordinate);
      if (!stack) throw new Error("No stack");
      return stack.composite;
    });

    this.changedPoints = XYSet.empty();

    return points;
  }

  set(point: Point) {
    let stack = this.pointStacks.get(point.location);
    if (!stack) {
      stack = new PointStack(point.location);

      stack.onRecomposition.subscribe(() => {
        this.noteChange(point.location);
      });

      this.pointStacks.set(point.location, stack);
    }

    stack.add(point);
  }

  removeAllPointsForElement(element: Element<any>) {
    /*
      Definitely need to improve this.
      Probably worth keeping a map of elements to coordinates.
      That way, we can just look up the coordinates and remove them,
      instead of iterating over everything.
    */

    for (const coordinate of this.pointStacks.coordinates) {
      const stack = this.pointStacks.get(coordinate);
      if (!stack) return; //  throw new Error("No stack");
      stack.removeByElement(element);
    }
  }

  removeElementAtXY(xy: XY, element: Element<any>) {
    const stack = this.pointStacks.get(xy);
    if (!stack) return; // throw new Error("No stack");
    stack.removeByElement(element);
  }

  clearWithinBounds(bounds: BoxBounds<any>, z: number) {
    for (const coordinate of bounds.globalCoordinatesWithin) {
      const stack = this.pointStacks.get(coordinate);
      if (!stack) continue;
      stack.removeAtAndAbove(z);
    }
  }

  getStack(coordinate: XY) {
    return this.pointStacks.get(coordinate);
  }
}
