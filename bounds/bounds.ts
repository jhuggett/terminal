import { Element } from "../elements/element.ts";
import { XY } from "../xy.ts";

export abstract class Bounds {
  abstract relativeWithin(xy: XY): boolean;
  abstract globalWithin(xy: XY): boolean;
}

export const within = (
  element: Element<any>,
  {
    padding,
    paddingBottom,
    paddingLeft,
    paddingRight,
    paddingTop,
    width,
    height,
  }: {
    padding?: number;
    paddingLeft?: number;
    paddingTop?: number;
    paddingRight?: number;
    paddingBottom?: number;
    width?: number;
    height?: number;
  } = {}
) => {
  return {
    start: {
      x: element.bounds.globalStart.x + (paddingLeft || padding || 0),
      y: element.bounds.globalStart.y + (paddingTop || padding || 0),
    },
    end: {
      x:
        element.bounds.globalEnd.x -
        (paddingRight || padding || 0) -
        (width || 0) -
        (paddingLeft || padding || 0),
      y:
        (height
          ? height + element.bounds.globalStart.y
          : element.bounds.globalEnd.y) -
        (paddingBottom || padding || 0) -
        (paddingTop || padding || 0),
    },
  };
};

export type StartEnd = {
  start: {
    x: number;
    y: number;
  };
  end: {
    x: number;
    y: number;
  };
};

export const below = (
  element: Element<any>,
  bounds: StartEnd,
  { spacing }: { spacing?: number } = {}
) => {
  return {
    start: {
      x: bounds.start.x,
      y: element.bounds.globalEnd.y + (spacing || 0),
    },
    end: {
      x: bounds.end.x,
      y:
        element.bounds.globalEnd.y +
        (spacing || 0) +
        (bounds.end.y - bounds.start.y),
    },
  };
};
