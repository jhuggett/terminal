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

export class XYSet {
  private xySet: Set<string>;
  constructor(coordinates: XY[]) {
    this.xySet = new Set(
      coordinates.map((coordinate) => XYToString(coordinate))
    );
  }

  add(coordinate: XY) {
    this.xySet.add(XYToString(coordinate));
  }

  has(coordinate: XY) {
    return this.xySet.has(XYToString(coordinate));
  }
}
