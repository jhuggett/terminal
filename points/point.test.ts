import { expect, test, jest } from "bun:test";
import { Element } from "../elements/element";
import { Point } from "./point";

test("can tell an element is higher than another element", () => {
  const lowerElement = {
    z: 0,
  } as unknown as Element<unknown>;

  const lowerPoint = new Point({ x: 0, y: 0 }, lowerElement);

  const higherElement = {
    z: 1,
  } as unknown as Element<unknown>;

  const higherPoint = new Point({ x: 0, y: 0 }, higherElement);

  expect(higherPoint.hasHigherZThan(lowerPoint)).toBe(true);
  expect(lowerPoint.hasHigherZThan(higherPoint)).toBe(false);
});
