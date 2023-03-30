import { multidimensionalRange } from "../../structures-and-algorithms/range.ts";
import { CompoundZIndex, Point } from "../point.ts";
import { Shell } from "../shells/shell.ts";
import { XY, XYSet, XYToString } from "../xy.ts";
import { Layer } from "./layer.ts";

type ComputedOrConstantNumber = number | (() => number);

export class Box extends Layer {
  get width() {
    if (typeof this.computedOrConstantWidth === "number")
      return this.computedOrConstantWidth;
    if (typeof this.computedOrConstantWidth === "function")
      return this.computedOrConstantWidth();
    throw new Error("Invalid computed or constant width.");
  }

  get height() {
    if (typeof this.computedOrConstantHeight === "number")
      return this.computedOrConstantHeight;
    if (typeof this.computedOrConstantHeight === "function")
      return this.computedOrConstantHeight();
    throw new Error("Invalid computed or constant height.");
  }

  get xOffset() {
    if (typeof this.computedOrConstantXOffset === "number")
      return this.computedOrConstantXOffset;
    if (typeof this.computedOrConstantXOffset === "function")
      return this.computedOrConstantXOffset();
    throw new Error("Invalid computed or constant x offset.");
  }

  get yOffset() {
    if (typeof this.computedOrConstantYOffset === "number")
      return this.computedOrConstantYOffset;
    if (typeof this.computedOrConstantYOffset === "function")
      return this.computedOrConstantYOffset();
    throw new Error("Invalid computed or constant y offset.");
  }

  private computedOrConstantWidth: ComputedOrConstantNumber;
  private computedOrConstantHeight: ComputedOrConstantNumber;
  private computedOrConstantXOffset: ComputedOrConstantNumber;
  private computedOrConstantYOffset: ComputedOrConstantNumber;
  public shell: Shell;
  public zIndex: CompoundZIndex;
  public parent?: Layer;

  constructor({
    computedOrConstantWidth,
    computedOrConstantHeight,
    computedOrConstantXOffset,
    computedOrConstantYOffset,
    shell,
    zIndex,
    parent,
  }: {
    computedOrConstantWidth?: ComputedOrConstantNumber;
    computedOrConstantHeight?: ComputedOrConstantNumber;
    computedOrConstantXOffset?: ComputedOrConstantNumber;
    computedOrConstantYOffset?: ComputedOrConstantNumber;
    shell: Shell;
    zIndex: CompoundZIndex;
    parent?: Layer;
  }) {
    super();
    this.computedOrConstantWidth = computedOrConstantWidth || 0;
    this.computedOrConstantHeight = computedOrConstantHeight || 0;
    this.computedOrConstantXOffset = computedOrConstantXOffset || 0;
    this.computedOrConstantYOffset = computedOrConstantYOffset || 0;
    this.shell = shell;
    this.zIndex = zIndex;
    this.parent = parent;
  }

  cursor: XY = {
    x: 0,
    y: 0,
  };

  moveCursorTo({
    x,
    y,
  }: {
    x?: number | "start" | "end";
    y?: number | "start" | "end";
  }) {
    if (x !== undefined) {
      if (x === "start") {
        this.cursor.x = 0;
      } else if (x === "end") {
        this.cursor.x = this.width - 1;
      } else {
        if (x >= 0 && x < this.width) {
          this.cursor.x = x;
        } else {
          throw new Error(`Cursor x is out of bounds.`);
        }
      }
    }
    if (y !== undefined) {
      if (y === "start") {
        this.cursor.y = 0;
      } else if (y === "end") {
        this.cursor.y = this.height - 1;
      } else {
        if (y >= 0 && y < this.height) {
          this.cursor.y = y;
        } else {
          throw new Error(`Cursor y is out of bounds.`);
        }
      }
    }
  }

  moveCursorHorizontally(steps: number, shouldCarriageReturn = true) {
    const proposedX = this.cursor.x + steps;
    if (proposedX < 0 || proposedX >= this.width) {
      if (shouldCarriageReturn) {
        this.moveCursorVertically(1);
        this.cursor.x = 0;
        return;
      }
      throw new Error("Attempting to move cursor out of bounds horizontally.");
    }
    this.cursor.x = proposedX;
  }

  moveCursorVertically(steps: number) {
    const proposedY = this.cursor.y + steps;
    if (proposedY < 0 || proposedY > this.height) {
      throw new Error("Attempting to move cursor out of bounds vertically.");
    }
    this.cursor.y = proposedY;
  }

  bufferedWriteString(
    str: string,
    options?: Omit<Point, "zIndex" | "coordinate" | "character">
  ) {
    for (const character of str) {
      this.bufferedWriteCharacter({
        character,
        ...options,
      });
    }
  }

  fill(pointTraits: Omit<Point, "zIndex" | "coordinate">) {
    this.moveCursorTo({ x: "start", y: "start" });
    for (let i = 0; i < this.width * this.height; i++) {
      this.bufferedWriteCharacter(pointTraits);
    }
  }

  bufferedWriteCharacter(pointTraits: Omit<Point, "zIndex" | "coordinate">) {
    this.set({
      ...pointTraits,
      coordinate: { ...this.cursor },
    });

    this.moveCursorHorizontally(1);
  }

  shift(coordinates: XY[], by: Partial<XY>) {
    const shiftedPointSet: XYSet = new XYSet([]);
    const shiftedPoints: Point[] = [];

    // gather the shifted points
    for (const coordinate of coordinates) {
      const point = this.lookup(coordinate);
      if (!point) continue;

      const shiftedCoordinate = {
        x: coordinate.x + (by.x || 0),
        y: coordinate.y + (by.y || 0),
      };
      shiftedPointSet.add(shiftedCoordinate);
      shiftedPoints.push({ ...point, coordinate: shiftedCoordinate });
    }

    // write the shifted points
    for (const point of shiftedPoints) {
      this.set(point);
    }

    // cleanup coordinates that have not been overwritten
    for (const coordinate of coordinates) {
      if (!shiftedPointSet.has(coordinate)) {
        this.clear(coordinate);
      }
    }

    return shiftedPoints.map((point) => point.coordinate);
  }

  /**
   * Pass nothing to clear all points the box can access.
   *
   * Pass a COLUMN number to clear that column.
   *
   * Pass a ROW number to clear that row.
   *
   * Pass an X and X to clear that coordinate.
   *
   * Pass a FROM coordinate to clear all points between FROM to the bottom left corner.
   *
   * Pass a TO coordinate to clear all points between the top left corner and TO.
   *
   * Pass a FROM and TO coordinate to clear all points between.
   */
  clear(
    options?: { column: number } | { row: number } | XY | { from?: XY; to?: XY }
  ) {
    let start: XY | undefined = undefined;
    let end: XY | undefined = undefined;

    const maxX = this.width - 1;
    const maxY = this.height - 1;

    if (!options) {
      start = { x: 0, y: 0 };
      end = { x: maxX, y: maxY };
    } else if ("column" in options) {
      start = { x: options.column, y: 0 };
      end = { x: options.column, y: maxY };
    } else if ("row" in options) {
      start = { x: 0, y: options.row };
      end = { x: maxX, y: options.row };
    } else if ("x" in options && "y" in options) {
      this.clearAt(options);
      return;
    } else if ("from" in options || "to" in options) {
      const { from, to } = options;
      if (from && to) {
        start = from;
        end = to;
      } else if (from) {
        start = from;
        end = { x: maxX, y: maxY };
      } else if (to) {
        start = { x: 0, y: 0 };
        end = to;
      }
    }

    if (!start || !end) throw new Error("Invalid options for clear.");

    multidimensionalRange(
      [
        { start: start.x, end: end.x },
        { start: start.y, end: end.y },
      ],
      ([x, y]) => {
        this.clearAt({ x, y });
      }
    );
  }

  /**
   * For width and height:
   *  - If omitted, it matches parent
   *  - If less than 1, it represents a percent of parent
   *  - If greater than 1, it represent a fix size
   *
   * For x and y offsets:
   *  - If omitted, it's aligned to left and top respectively
   *  - If less than 1, it represents a percent of parent
   *  - If greater than 1, it represent a fix offset
   *  - If one of available string literals, should be self explanatory
   */
  newLayer({
    width,
    height,
    xOffset,
    yOffset,
  }: {
    width?: number;
    height?: number;
    xOffset?: number | "middle" | "right";
    yOffset?: number | "middle" | "bottom";
  }) {
    const box = new Box({
      shell: this.shell,
      zIndex: new CompoundZIndex([...this.zIndex.indexes, 0]),
    });

    if (width) {
      if (width < 1) {
        box.computedOrConstantWidth = () => Math.floor(this.width * width);
      } else {
        box.computedOrConstantWidth = width;
      }
    } else {
      box.computedOrConstantWidth = () => this.width;
    }

    if (height) {
      if (height < 1) {
        box.computedOrConstantHeight = () => Math.floor(this.height * height);
      } else {
        box.computedOrConstantHeight = height;
      }
    } else {
      box.computedOrConstantHeight = () => this.height;
    }

    if (xOffset) {
      if (xOffset === "middle") {
        box.computedOrConstantXOffset = () =>
          Math.floor(this.width / 2 - box.width / 2);
      } else if (xOffset === "right") {
        box.computedOrConstantXOffset = () =>
          Math.floor(this.width - box.width);
      } else if (xOffset < 1) {
        box.computedOrConstantXOffset = () => Math.floor(this.width * xOffset);
      } else {
        box.computedOrConstantXOffset = xOffset;
      }
    } else {
      box.computedOrConstantXOffset = this.xOffset;
    }

    if (yOffset) {
      if (yOffset === "middle") {
        box.computedOrConstantYOffset = () =>
          Math.floor(this.height / 2 - box.height / 2);
      } else if (yOffset === "bottom") {
        box.computedOrConstantYOffset = () =>
          Math.floor(this.height - box.height);
      } else if (yOffset < 1) {
        box.computedOrConstantYOffset = () => Math.floor(this.height * yOffset);
      } else {
        box.computedOrConstantYOffset = yOffset;
      }
    } else {
      box.computedOrConstantYOffset = this.yOffset;
    }

    return box;
  }

  splitVertically() {
    const top = new Box({
      computedOrConstantWidth: () => this.width,
      computedOrConstantHeight: () => Math.floor(this.height / 2),
      computedOrConstantXOffset: () => this.xOffset,
      computedOrConstantYOffset: () => this.yOffset,
      shell: this.shell,
      zIndex: new CompoundZIndex([...this.zIndex.indexes, 0]),
    });
    const bottom = new Box({
      computedOrConstantWidth: () => this.width,
      computedOrConstantHeight: () => Math.floor(this.height / 2),
      computedOrConstantXOffset: () => this.xOffset,
      computedOrConstantYOffset: () =>
        this.yOffset + (this.height - Math.floor(this.height / 2)),
      shell: this.shell,
      zIndex: new CompoundZIndex([...this.zIndex.indexes, 1]),
    });

    return {
      top,
      bottom,
    };
  }

  splitHorizontally() {
    const left = new Box({
      computedOrConstantWidth: () => Math.floor(this.width / 2),
      computedOrConstantHeight: () => this.height,
      computedOrConstantXOffset: () => this.xOffset,
      computedOrConstantYOffset: () => this.yOffset,
      shell: this.shell,
      zIndex: new CompoundZIndex([...this.zIndex.indexes, 0]),
    });
    const right = new Box({
      computedOrConstantWidth: () => Math.floor(this.width / 2),
      computedOrConstantHeight: () => this.height,
      computedOrConstantXOffset: () =>
        this.xOffset + (this.width - Math.floor(this.width / 2)),
      computedOrConstantYOffset: () => this.yOffset,
      shell: this.shell,
      zIndex: new CompoundZIndex([...this.zIndex.indexes, 1]),
    });

    return {
      left,
      right,
    };
  }
}
