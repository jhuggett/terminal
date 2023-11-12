import { expect, test, jest } from "bun:test";

import { Element } from "../elements/element";
import { Point } from "../points/point";
import { PointStack } from "./point-stack";

test("can add a point", () => {
  const element = {
    z: 0,
  } as unknown as Element<any>;

  const lowerPoint = new Point({ x: 0, y: 0 }, element);

  const stack = new PointStack({ x: 0, y: 0 });

  expect(stack.composite).toBe(null);

  let recomposed = false;
  stack.onRecomposition.subscribe(() => {
    recomposed = true;
  });

  stack.add(lowerPoint);

  expect(stack.composite).not.toBe(null);
  expect(recomposed).toBe(true);
});
