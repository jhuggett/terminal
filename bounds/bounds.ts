import { XY } from "../xy.ts";

export abstract class Bounds {
  abstract relativeWithin(xy: XY): boolean;
  abstract globalWithin(xy: XY): boolean;
}
