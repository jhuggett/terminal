import { Element } from "../elements/element.ts";
import { SubscribableEvent } from "../subscribable-event.ts";
import { XY, combineXY, subtractXY } from "../xy.ts";
import { Bounds } from "./bounds.ts";

export class BoxBounds<Properties> extends Bounds {
  globalStart: XY;
  globalEnd: XY;

  constructor(
    public calculateGlobalPositions: (props: Properties) => {
      start: XY;
      end: XY;
    },
    properties: Properties
  ) {
    super();

    const { start, end } = calculateGlobalPositions(properties);
    this.globalStart = start;
    this.globalEnd = end;
  }

  get width() {
    return this.globalEnd.x - this.globalStart.x;
  }

  get height() {
    return this.globalEnd.y - this.globalStart.y;
  }

  get relativeStart() {
    return { x: 0, y: 0 };
  }

  get relativeEnd() {
    return { x: this.width, y: this.height };
  }

  toGlobal({ x, y }: XY) {
    return combineXY([this.globalStart, { x, y }]);
  }

  toRelative({ x, y }: XY) {
    return subtractXY([{ x, y }, this.globalStart]);
  }

  recalculate(properties: Properties) {
    const { start, end } = this.calculateGlobalPositions(properties);
    this.globalStart = start;
    this.globalEnd = end;
    this._globalCoordinatesWithin = undefined;
    this.onRecalculate.emit(this);
  }

  onRecalculate = new SubscribableEvent<BoxBounds<Properties>>();

  relativeWithin({ x, y }: XY) {
    return (
      x >= this.relativeStart.x &&
      x < this.relativeEnd.x &&
      y >= this.relativeStart.y &&
      y < this.relativeEnd.y
    );
  }

  globalWithin({ x, y }: XY) {
    return (
      x >= this.globalStart.x &&
      x < this.globalEnd.x &&
      y >= this.globalStart.y &&
      y < this.globalEnd.y
    );
  }

  private _globalCoordinatesWithin?: XY[];
  get globalCoordinatesWithin() {
    if (!this._globalCoordinatesWithin) {
      const coordinates: XY[] = [];
      for (let x = this.globalStart.x; x < this.globalEnd.x; x++) {
        for (let y = this.globalStart.y; y < this.globalEnd.y; y++) {
          coordinates.push({ x, y });
        }
      }
      this._globalCoordinatesWithin = coordinates;
    }
    return this._globalCoordinatesWithin;
  }
}
