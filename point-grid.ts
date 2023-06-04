import { CompoundZIndex, Point, rendering } from "./point.ts";
import { PointStack } from "./point-stack.ts";
import { XY } from "./xy.ts";

export class PointGrid {
  private pointStacks: Map<string, PointStack> = new Map();
  private changedPoints: Set<string> = new Set();

  get hasChangedPoints() {
    return this.changedPoints.size > 0;
  }

  private coordinateToKey({ x, y }: XY) {
    return `${x},${y}`;
  }

  private keyToCoordinate(key: string) {
    const [x, y] = key.split(",");
    return { x: parseInt(x), y: parseInt(y) };
  }

  private getPointStackAt(coordinate: XY) {
    return this.pointStacks.get(this.coordinateToKey(coordinate));
  }

  private noteChange(coordinate: XY) {
    this.changedPoints.add(this.coordinateToKey(coordinate));
  }

  set(point: Point) {
    let stack = this.getPointStackAt(point.coordinate);
    if (!stack) {
      stack = new PointStack(
        () => {
          this.noteChange(point.coordinate);
        },
        () => {
          this.noteChange(point.coordinate);
          this.pointStacks.delete(this.coordinateToKey(point.coordinate));
        }
      );
      this.pointStacks.set(this.coordinateToKey(point.coordinate), stack);
    }
    const existingPoint = stack.get(point.zIndex);
    if (
      existingPoint &&
      rendering(existingPoint, stack) === rendering(point, stack)
    )
      return;
    stack.set(point);
  }

  find(coordinate: XY, zIndex: CompoundZIndex) {
    return this.pointStacks.get(this.coordinateToKey(coordinate))?.get(zIndex);
  }

  clear(coordinate: XY, zIndex: CompoundZIndex) {
    const stack = this.getPointStackAt(coordinate);
    if (!stack) return;
    stack.clear(zIndex);
  }

  getChangedPoints() {
    const points = Array.from(this.changedPoints.values()).map((key) => {
      const coordinate = this.keyToCoordinate(key);
      const stack = this.getPointStackAt(coordinate);
      const point = stack?.highestPoint;
      return {
        coordinate,
        point,
        stack,
      };
    });
    return points;
  }

  flushNotedChanges() {
    this.changedPoints = new Set();
  }

  reset() {
    this.pointStacks = new Map();
    this.flushNotedChanges();
  }
}
