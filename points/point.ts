import { RGB } from "../color/rgb.ts";
import { Element } from "../elements/element.ts";
import { XY } from "../xy.ts";

export interface PointProperties {
  foregroundColor?: RGB;
  backgroundColor?: RGB;

  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
}

export class Point {
  constructor(public location: XY, public element: Element<any>) {}

  properties: PointProperties = {};

  character?: string;
}
