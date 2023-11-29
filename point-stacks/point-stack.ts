import { equalRGBs, mergeRBGs, red } from "../color/rgb.ts";
import { Element } from "../elements/element.ts";
import { Point, PointProperties } from "../points/point.ts";
import { SubscribableEvent } from "../subscribable-event.ts";
import { XY } from "../xy.ts";

const compositionsAreDifferent = (
  previous: Point | null,
  current: Point | null
) => {
  if (!previous && !current) {
    return false;
  }

  if (!previous || !current) {
    return true;
  }

  return (
    previous.character !== current.character ||
    previous.properties.bold !== current.properties.bold ||
    previous.properties.italic !== current.properties.italic ||
    previous.properties.underline !== current.properties.underline ||
    !equalRGBs(
      previous.properties.foregroundColor,
      current.properties.foregroundColor
    ) ||
    !equalRGBs(
      previous.properties.backgroundColor,
      current.properties.backgroundColor
    )
  );
};

const emptyPoint = (location: XY) => {
  const element = {
    z: 0,
    id: -1,
  } as unknown as Element<any>;

  const point = new Point(location, element);
  point.character = " ";

  return point;
};

export class PointStack {
  stack: Point[] = [];

  composite: Point;
  constructor(public location: XY) {
    this.composite = emptyPoint(location);
  }

  onRecomposition = new SubscribableEvent<Point | null>();

  compose() {
    let compositePoint: Point | null = null;

    for (const point of this.stack) {
      if (!compositePoint) {
        compositePoint = new Point(point.location, point.element);
        compositePoint.character = point.character;
        compositePoint.properties = {
          bold: point.properties.bold,
          italic: point.properties.italic,
          underline: point.properties.underline,
        };
      }

      if (!compositePoint.properties.foregroundColor) {
        compositePoint.properties.foregroundColor =
          point.properties.foregroundColor;
      } else if (point.properties.foregroundColor) {
        compositePoint.properties.foregroundColor = mergeRBGs(
          compositePoint.properties.foregroundColor,
          point.properties.foregroundColor
        );
      }

      if (!compositePoint.properties.backgroundColor) {
        compositePoint.properties.backgroundColor =
          point.properties.backgroundColor;
      } else if (point.properties.backgroundColor) {
        compositePoint.properties.backgroundColor = mergeRBGs(
          compositePoint.properties.backgroundColor,
          point.properties.backgroundColor
        );
      }

      // if (compositePoint.properties.bold === undefined) {
      //   compositePoint.properties.bold = point.properties.bold;
      // }

      // if (compositePoint.properties.italic === undefined) {
      //   compositePoint.properties.italic = point.properties.italic;
      // }

      // if (compositePoint.properties.underline === undefined) {
      //   compositePoint.properties.underline = point.properties.underline;
      // }

      if (
        compositePoint.character === " " &&
        compositePoint.properties.backgroundColor?.a !== 1
      ) {
        if (
          point.properties.foregroundColor &&
          compositePoint.properties.backgroundColor
        ) {
          compositePoint.properties.foregroundColor = mergeRBGs(
            compositePoint.properties.backgroundColor,
            point.properties.foregroundColor
          );
        } else if (point.properties.foregroundColor) {
          compositePoint.properties.foregroundColor =
            point.properties.foregroundColor;
        }
        compositePoint.character = point.character;
        compositePoint.properties.bold = point.properties.bold;
        compositePoint.properties.italic = point.properties.italic;
        compositePoint.properties.underline = point.properties.underline;
      }

      if (
        compositePoint.properties.foregroundColor?.a === 1 &&
        compositePoint.properties.backgroundColor?.a === 1
      ) {
        break;
      }
    }

    if (!compositePoint) {
      compositePoint = emptyPoint(this.location);
    }

    const previousComposite = this.composite;
    this.composite = compositePoint;

    if (compositionsAreDifferent(previousComposite, this.composite)) {
      this.onRecomposition.emit(this.composite);
    }
  }

  sort() {
    this.stack.sort((a, b) => {
      if (a.element.z === b.element.z) {
        if (a.element.id > b.element.id) {
          return -1;
        } else {
          return 1;
        }
      }
      if (a.element.z > b.element.z) {
        return -1;
      }
      if (a.element.z < b.element.z) {
        return 1;
      }
      return 0;
    });
  }

  add(point: Point) {
    this.stack = this.stack.filter((p) => !(p.element.id === point.element.id));

    this.stack.push(point);

    this.sort();

    this.compose();
  }

  remove(point: Point) {
    this.removeByElement(point.element);
  }

  removeByElement(element: Element<unknown>) {
    this.stack = this.stack.filter((p) => !(p.element.id === element.id));

    this.compose();
  }

  removeAtAndAbove(z: number) {
    this.stack = this.stack.filter((p) => p.element.z < z);
    this.compose();
  }
}
