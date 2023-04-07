import { CompoundZIndex, Point } from "../point.ts";
import { Shell } from "../shells/shell.ts";
import { XY } from "../xy.ts";

export class OutOfBoundsError extends Error {
  constructor(msg: string, public axis: "x" | "y") {
    super(msg);
  }
}

export abstract class Layer {
  abstract get width(): number;
  abstract get height(): number;

  // offset from shell
  abstract get xOffset(): number;
  abstract get yOffset(): number;

  abstract shell: Shell;

  parent?: Layer;

  abstract zIndex: CompoundZIndex;

  protected applyShellOffset({ x, y }: XY) {
    return {
      x: x + this.xOffset,
      y: y + this.yOffset,
    };
  }

  protected deductShellOffset({ x, y }: XY) {
    return {
      x: x - this.xOffset,
      y: y - this.yOffset,
    };
  }

  verifyXWithinBounds(x: number) {
    if (x < 0 || x >= this.width)
      throw new OutOfBoundsError(`Point is out of bounds for layer.`, "x");
  }

  verifyYWithinBounds(y: number) {
    if (y < 0 || y >= this.height)
      throw new OutOfBoundsError(`Point is out of bounds for layer.`, "y");
  }

  protected set(point: Omit<Point, "zIndex">) {
    if (point.character.length !== 1)
      throw new Error(`Invalid point character: "${point.character}".`);
    const { x, y } = point.coordinate;

    this.verifyXWithinBounds(x);
    this.verifyYWithinBounds(y);

    const translatedPoint: Point = {
      ...point,
      coordinate: this.applyShellOffset(point.coordinate),
      zIndex: this.zIndex,
    };

    this.shell.bufferedWrite(translatedPoint);
  }

  protected lookup(coordinate: XY) {
    const point = this.shell.findPoint(
      this.applyShellOffset(coordinate),
      this.zIndex
    );
    if (point) {
      // translate point
      return {
        ...point,
        coordinate: this.deductShellOffset(point.coordinate),
      };
    }
  }

  protected clearAt(coordinate: XY) {
    const translatedCoordinate = this.applyShellOffset(coordinate);
    this.shell.bufferedClear(translatedCoordinate, this.zIndex);
  }
}
