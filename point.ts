import { XY } from "./xy.ts";

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export class CompoundZIndex {
  stringRepresentation: string;
  length: number;
  constructor(public indexes: number[]) {
    this.stringRepresentation = indexes.join("-");
    this.length = indexes.length;
  }

  isGreaterThan(zIndex: CompoundZIndex) {
    if (this.length > zIndex.length) return true;
    if (this.length < zIndex.length) return false;

    for (const [z, i] of this.indexes.entries()) {
      const otherZ = zIndex.indexes[i];
      if (otherZ > z) return false;
    }
    return true;
  }

  isLessThan(zIndex: CompoundZIndex) {
    if (this.length < zIndex.length) return true;
    if (this.length > zIndex.length) return false;

    for (const [z, i] of this.indexes.entries()) {
      const otherZ = zIndex.indexes[i];
      if (otherZ < z) return false;
    }
    return true;
  }
}

export interface Point {
  coordinate: XY;
  character: string;
  zIndex: CompoundZIndex;
  foregroundColor?: RGB;
  backgroundColor?: RGB;
}

// the +1s account for the term origin being 1,1
export const moveTo = (x: number, y: number) => `\u001b[${y + 1};${x + 1}H`;
const setForegroundColor = (r: number, g: number, b: number) =>
  `\u001b[38;2;${r};${g};${b}m`;
const setBackgroundColor = (r: number, g: number, b: number) =>
  `\u001b[48;2;${r};${g};${b}m`;
const reset = `\u001b[0m`;

export const rendering = (point: Point) => {
  const { x, y } = point.coordinate;
  let piece = moveTo(x, y);
  let styled = false;
  if (point) {
    if (point.foregroundColor) {
      piece += setForegroundColor(
        point.foregroundColor.r,
        point.foregroundColor.g,
        point.foregroundColor.b
      );
      styled = true;
    }
    if (point.backgroundColor) {
      piece += setBackgroundColor(
        point.backgroundColor.r,
        point.backgroundColor.g,
        point.backgroundColor.b
      );
      styled = true;
    }
    piece += point.character;
  } else {
    piece += " ";
  }
  if (styled) {
    piece += reset;
  }
  return piece;
};
