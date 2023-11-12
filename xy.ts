export const XYToString = ({ x, y }: XY) => `${x},${y}`;
export const parseXY = (str: string) => {
  const [x, y] = str.split(",");
  return {
    x: parseInt(x),
    y: parseInt(y),
  };
};

export interface XY {
  x: number;
  y: number;
}

export const combineXY = (coordinates: XY[]): XY => {
  if (coordinates.length === 0)
    throw new Error("combineXY requires at least one coordinate");
  if (coordinates.length === 1) return { ...coordinates[0] };
  const xy = { x: 0, y: 0 };
  coordinates.forEach(({ x, y }) => {
    xy.x += x;
    xy.y += y;
  });
  return xy;
};

export const subtractXY = (coordinates: XY[]): XY => {
  if (coordinates.length === 0)
    throw new Error("subtractXY requires at least one coordinate");
  const xy = { ...coordinates[0] };
  if (coordinates.length === 1) {
    return xy;
  }
  coordinates.slice(1).forEach(({ x, y }) => {
    xy.x -= x;
    xy.y -= y;
  });
  return xy;
};

export class XYSet {
  private xySet: Set<string>;
  constructor(coordinates: XY[]) {
    this.xySet = new Set(
      coordinates.map((coordinate) => {
        this.noteIfOutermost(coordinate);
        return XYToString(coordinate);
      })
    );
  }

  private noteIfOutermost(xy: XY) {
    if (!this.topmost || xy.y < this.topmost.y) {
      this.topmost = xy;
    }
    if (!this.bottommost || xy.y > this.bottommost.y) {
      this.bottommost = xy;
    }
    if (!this.rightmost || xy.x > this.rightmost.x) {
      this.rightmost = xy;
    }
    if (!this.leftmost || xy.x < this.leftmost.x) {
      this.leftmost = xy;
    }
  }

  topmost?: XY;
  bottommost?: XY;
  rightmost?: XY;
  leftmost?: XY;

  add(coordinate: XY) {
    this.xySet.add(XYToString(coordinate));
    this.noteIfOutermost(coordinate);
  }

  has(coordinate: XY) {
    return this.xySet.has(XYToString(coordinate));
  }

  copy() {
    return new XYSet(Array.from(this.xySet.values()).map((xy) => parseXY(xy)));
  }

  exclude(otherXYSet: XYSet) {
    return this.coordinates.filter((xy) => !otherXYSet.has(xy));
  }

  remove(coordinate: XY) {
    this.xySet.delete(XYToString(coordinate));
  }

  get coordinates() {
    return Array.from(this.xySet.values()).map((xy) => parseXY(xy));
  }

  static empty() {
    return new XYSet([]);
  }

  get size() {
    return this.xySet.size;
  }
}

export class XYMap<Value> {
  private map: Map<string, Value>;
  constructor() {
    this.map = new Map();
  }

  set(coordinate: XY, value: Value) {
    this.map.set(XYToString(coordinate), value);
  }

  get(coordinate: XY) {
    return this.map.get(XYToString(coordinate));
  }

  delete(coordinate: XY) {
    this.map.delete(XYToString(coordinate));
  }

  get coordinates() {
    return Array.from(this.map.keys()).map((xy) => parseXY(xy));
  }

  get values() {
    return Array.from(this.map.values());
  }

  get size() {
    return this.map.size;
  }
}
