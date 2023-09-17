import { Box } from "../../treasure/deps.ts";
import { CompoundZIndex, Point } from "../point.ts";
import { Shell } from "../shells/shell.ts";
import { XY } from "../xy.ts";

export class OutOfBoundsError extends Error {
  constructor(msg: string, public axis: "x" | "y") {
    super(msg);
  }
}

export const portion = {
  full: () =>
    select([
      [1, 1],
      [0, 0],
      [1, 1],
    ]),
};

export const margined = (parent: Box, x: number, y: number) =>
  select([
    [parent.width, parent.height],
    [x, y],
    [parent.width - x, parent.height - y],
  ]);

export const select = ([division, start, end]: [number, number][]) => ({
  division: {
    x: division[0],
    y: division[1],
  },
  start: {
    x: start[0],
    y: start[1],
  },
  end: {
    x: end[0],
    y: end[1],
  },
});

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
    if (x < 0 || x > this.width)
      throw new OutOfBoundsError(
        `Point is out of bounds for layer. x: ${x}, width: ${this.width}`,
        "x"
      );
  }

  verifyYWithinBounds(y: number) {
    if (y < 0 || y > this.height)
      throw new OutOfBoundsError(
        `Point is out of bounds for layer. y: ${y}, height: ${this.height}`,
        "y"
      );
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

  protected notifyOnCachedDimensionsInvalidation: Map<string, () => void> =
    new Map();
  listenForCachedDimensionsInvalidation(layer: Layer, callback: () => void) {
    this.notifyOnCachedDimensionsInvalidation.set(
      layer.zIndex.stringRepresentation,
      callback
    );
  }
}
