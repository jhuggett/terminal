// import { OutOfBoundsError } from "../mod.ts";
// import { KDIndex, Point } from "../points/point.ts";
// import { multidimensionalRange } from "../range.ts";
// import { Shell } from "../shells/shell.ts";
// import { XY, XYSet } from "../xy.ts";
// import { Element } from "./element.ts";

// type ComputedOrConstantNumber = number | (() => number);

// export class Box extends Element {
//   private cached_width?: number;
//   get width() {
//     if (this.cached_width === undefined) {
//       if (typeof this.computedOrConstantWidth === "number")
//         this.cached_width = this.computedOrConstantWidth;
//       else if (typeof this.computedOrConstantWidth === "function")
//         this.cached_width = this.computedOrConstantWidth();
//       else throw new Error("Invalid computed or constant width.");
//     }
//     return this.cached_width;
//   }

//   private cached_height?: number;
//   get height() {
//     if (this.cached_height === undefined) {
//       if (typeof this.computedOrConstantHeight === "number")
//         this.cached_height = this.computedOrConstantHeight;
//       else if (typeof this.computedOrConstantHeight === "function")
//         this.cached_height = this.computedOrConstantHeight();
//       else throw new Error("Invalid computed or constant height.");
//     }
//     return this.cached_height;
//   }

//   private cached_x_offset?: number;
//   get xOffset() {
//     if (this.cached_x_offset === undefined) {
//       if (typeof this.computedOrConstantXOffset === "number")
//         this.cached_x_offset = this.computedOrConstantXOffset;
//       else if (typeof this.computedOrConstantXOffset === "function")
//         this.cached_x_offset = this.computedOrConstantXOffset();
//       else throw new Error("Invalid computed or constant x offset.");
//     }
//     return this.cached_x_offset;
//   }

//   private cached_y_offset?: number;
//   get yOffset() {
//     if (this.cached_y_offset === undefined) {
//       if (typeof this.computedOrConstantYOffset === "number")
//         this.cached_y_offset = this.computedOrConstantYOffset;
//       else if (typeof this.computedOrConstantYOffset === "function")
//         this.cached_y_offset = this.computedOrConstantYOffset();
//       else throw new Error("Invalid computed or constant y offset.");
//     }
//     return this.cached_y_offset;
//   }

//   invalidateCachedDimensions() {
//     this.cached_height = undefined;
//     this.cached_width = undefined;
//     this.cached_x_offset = undefined;
//     this.cached_y_offset = undefined;

//     this.notifyOnCachedDimensionsInvalidation.forEach((callback) => {
//       callback();
//     });
//   }

//   private computedOrConstantWidth: ComputedOrConstantNumber;
//   private computedOrConstantHeight: ComputedOrConstantNumber;
//   private computedOrConstantXOffset: ComputedOrConstantNumber;
//   private computedOrConstantYOffset: ComputedOrConstantNumber;
//   public shell: Shell;
//   public z: KDIndex;
//   public parent?: Element;

//   constructor({
//     computedOrConstantWidth,
//     computedOrConstantHeight,
//     computedOrConstantXOffset,
//     computedOrConstantYOffset,
//     shell,
//     z,
//     parent,
//   }: {
//     computedOrConstantWidth?: ComputedOrConstantNumber;
//     computedOrConstantHeight?: ComputedOrConstantNumber;
//     computedOrConstantXOffset?: ComputedOrConstantNumber;
//     computedOrConstantYOffset?: ComputedOrConstantNumber;
//     shell: Shell;
//     z: KDIndex;
//     parent?: Element;
//   }) {
//     super();
//     this.computedOrConstantWidth = computedOrConstantWidth || 0;
//     this.computedOrConstantHeight = computedOrConstantHeight || 0;
//     this.computedOrConstantXOffset = computedOrConstantXOffset || 0;
//     this.computedOrConstantYOffset = computedOrConstantYOffset || 0;
//     this.shell = shell;
//     this.z = z;

//     parent?.listenForCachedDimensionsInvalidation(this, () => {
//       this.invalidateCachedDimensions();
//     });

//     this.parent = parent;
//   }

//   debugLabel?: string;
//   debugInfo() {
//     return {
//       debugLabel: this.debugLabel,
//       width: this.width,
//       height: this.height,
//       xOffset: this.xOffset,
//       yOffset: this.yOffset,
//       z: this.z.stringRepresentation,
//     };
//   }

//   cursor: XY = {
//     x: 0,
//     y: 0,
//   };

//   moveCursorTo({
//     x,
//     y,
//   }: {
//     x?: number | "start" | "end";
//     y?: number | "start" | "end";
//   }) {
//     if (x !== undefined) {
//       if (x === "start") {
//         this.cursor.x = 0;
//       } else if (x === "end") {
//         this.cursor.x = this.width - 1;
//       } else {
//         if (x >= 0 && x < this.width) {
//           this.cursor.x = x;
//         } else {
//           throw new OutOfBoundsError(`Cursor x (${x}) is out of bounds.`, "x");
//         }
//       }
//     }
//     if (y !== undefined) {
//       if (y === "start") {
//         this.cursor.y = 0;
//       } else if (y === "end") {
//         this.cursor.y = this.height - 1;
//       } else {
//         if (y >= 0 && y < this.height) {
//           this.cursor.y = y;
//         } else {
//           throw new OutOfBoundsError(`Cursor y (${y}) is out of bounds.`, "y");
//         }
//       }
//     }
//   }

//   carriageReturn() {
//     this.moveCursorVertically(1);
//     this.moveCursorTo({ x: "start" });
//   }

//   moveCursorHorizontally(steps: number, shouldCarriageReturn = true) {
//     const proposedX = this.cursor.x + steps;
//     if (proposedX < 0 || proposedX >= this.width) {
//       if (shouldCarriageReturn) {
//         this.moveCursorVertically(1);
//         this.cursor.x = 0;
//         return;
//       }
//       throw new OutOfBoundsError(
//         "Attempting to move cursor out of bounds horizontally.",
//         "x"
//       );
//     }
//     this.cursor.x = proposedX;
//   }

//   moveCursorVertically(steps: number) {
//     const proposedY = this.cursor.y + steps;

//     if (proposedY < 0 || proposedY > this.height) {
//       throw new OutOfBoundsError(
//         "Attempting to move cursor out of bounds vertically.",
//         "y"
//       );
//     }
//     this.cursor.y = proposedY;
//   }

//   bufferedWriteString(
//     str: string,
//     options?: Omit<Point, "z" | "coordinate" | "character">
//   ) {
//     for (const character of str) {
//       this.bufferedWriteCharacter({
//         character,
//         ...options,
//       });
//     }
//   }

//   fill(
//     pointTraits:
//       | Omit<Point, "z" | "coordinate">
//       | (() => Omit<Point, "z" | "coordinate">)
//   ) {
//     this.moveCursorTo({ x: "start", y: "start" });
//     for (let i = 0; i < this.width * this.height; i++) {
//       this.bufferedWriteCharacter(
//         typeof pointTraits === "function" ? pointTraits() : pointTraits
//       );
//     }
//   }

//   bufferedWriteCharacter(
//     pointTraits: Omit<Point, "z" | "coordinate">,
//     at?: XY
//   ) {
//     if (at) {
//       this.moveCursorTo(at);
//     }
//     this.set({
//       ...pointTraits,
//       coordinate: { ...this.cursor },
//     });

//     this.moveCursorHorizontally(1);
//   }

//   shift(coordinates: XY[], by: Partial<XY>) {
//     const shiftedPointSet: XYSet = new XYSet([]);
//     const shiftedPoints: Point[] = [];

//     // gather the shifted points
//     for (const coordinate of coordinates) {
//       const point = this.lookup(coordinate);
//       if (!point) continue;

//       const shiftedCoordinate = {
//         x: coordinate.x + (by.x || 0),
//         y: coordinate.y + (by.y || 0),
//       };

//       this.verifyXWithinBounds(shiftedCoordinate.x);
//       this.verifyYWithinBounds(shiftedCoordinate.y);

//       shiftedPointSet.add(shiftedCoordinate);
//       shiftedPoints.push({ ...point, coordinate: shiftedCoordinate });
//     }

//     // write the shifted points
//     for (const point of shiftedPoints) {
//       this.set(point);
//     }

//     // cleanup coordinates that have not been overwritten
//     for (const coordinate of coordinates) {
//       if (!shiftedPointSet.has(coordinate)) {
//         this.clear(coordinate);
//       }
//     }

//     return shiftedPoints.map((point) => point.coordinate);
//   }

//   /**
//    * Pass nothing to clear all points the box can access.
//    *
//    * Pass a COLUMN number to clear that column.
//    *
//    * Pass a ROW number to clear that row.
//    *
//    * Pass an X and Y to clear that coordinate.
//    *
//    * Pass a FROM coordinate to clear all points between FROM to the bottom left corner.
//    *
//    * Pass a TO coordinate to clear all points between the top left corner and TO.
//    *
//    * Pass a FROM and TO coordinate to clear all points between.
//    */
//   clear(
//     options?: { column: number } | { row: number } | XY | { from?: XY; to?: XY }
//   ) {
//     let start: XY | undefined = undefined;
//     let end: XY | undefined = undefined;

//     const maxX = this.width - 1;
//     const maxY = this.height - 1;

//     if (!options) {
//       start = { x: 0, y: 0 };
//       end = { x: maxX, y: maxY };
//     } else if ("column" in options) {
//       start = { x: options.column, y: 0 };
//       end = { x: options.column, y: maxY };
//     } else if ("row" in options) {
//       start = { x: 0, y: options.row };
//       end = { x: maxX, y: options.row };
//     } else if ("x" in options && "y" in options) {
//       this.clearAt(options);
//       return;
//     } else if ("from" in options || "to" in options) {
//       const { from, to } = options;
//       if (from && to) {
//         start = from;
//         end = to;
//       } else if (from) {
//         start = from;
//         end = { x: maxX, y: maxY };
//       } else if (to) {
//         start = { x: 0, y: 0 };
//         end = to;
//       }
//     }

//     if (!start || !end) throw new Error("Invalid options for clear.");

//     multidimensionalRange(
//       [
//         { start: start.x, end: end.x },
//         { start: start.y, end: end.y },
//       ],
//       ([x, y]) => {
//         this.clearAt({ x, y });
//       }
//     );
//   }

//   protected layerIncrement = 0;

//   element({
//     division,
//     start,
//     end,
//     newzGroup,
//   }: {
//     division: XY;
//     start: XY;
//     end: XY;
//     newzGroup?: boolean;
//   }) {
//     const box = new Box({
//       parent: this,
//       shell: this.shell,
//       z: newzGroup
//         ? this.shell.registry.newCZIInNextContext(this.z)
//         : this.shell.registry.newCZIInCurrentContext(this.z),
//     });

//     if (!newzGroup) {
//       this.layerIncrement++;
//     } else box.layerIncrement++;

//     box.computedOrConstantXOffset = () =>
//       this.xOffset + Math.floor(start.x * (this.width / division.x));
//     box.computedOrConstantYOffset = () =>
//       this.yOffset + Math.floor(start.y * (this.height / division.y));

//     box.computedOrConstantWidth = () =>
//       Math.floor((end.x - start.x) * (this.width / division.x));
//     box.computedOrConstantHeight = () =>
//       Math.floor((end.y - start.y) * (this.height / division.y));

//     return box;
//   }

//   get topLeft() {
//     return {
//       x: this.xOffset,
//       y: this.yOffset,
//     };
//   }

//   get topRight() {
//     return {
//       x: this.width + this.xOffset,
//       y: this.yOffset,
//     };
//   }

//   get middle() {
//     return {
//       x: Math.floor(this.width / 2) + this.xOffset,
//       y: Math.floor(this.height / 2) + this.yOffset,
//     };
//   }

//   get bottomRight() {
//     return {
//       x: this.width + this.xOffset,
//       y: this.height + this.yOffset,
//     };
//   }

//   get bottomLeft() {
//     return {
//       x: this.xOffset,
//       y: this.height + this.yOffset,
//     };
//   }
// }
