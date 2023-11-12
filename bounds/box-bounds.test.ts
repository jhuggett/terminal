import { expect, test } from "bun:test";
import { BoxBounds } from "./box-bounds";

test("calculates width and height", () => {
  const bounds = new BoxBounds(() => ({
    start: { x: 0, y: 0 },
    end: { x: 10, y: 10 },
  }));

  expect(bounds.width).toBe(10);
  expect(bounds.height).toBe(10);
});

test("identifies coordinate is within relative bounds", () => {
  const bounds = new BoxBounds(() => ({
    start: { x: 5, y: 5 },
    end: { x: 10, y: 10 },
  }));

  expect(bounds.relativeWithin({ x: 0, y: 5 })).toBe(true);
});

test("identifies coordinate is not within relative bounds", () => {
  const bounds = new BoxBounds(() => ({
    start: { x: 5, y: 5 },
    end: { x: 10, y: 10 },
  }));

  expect(bounds.relativeWithin({ x: 6, y: 11 })).toBe(false);
});

test("identifies coordinate is within global bounds", () => {
  const bounds = new BoxBounds(() => ({
    start: { x: 5, y: 5 },
    end: { x: 10, y: 10 },
  }));

  expect(bounds.globalWithin({ x: 6, y: 5 })).toBe(true);
});

test("identifies coordinate is not within global bounds", () => {
  const bounds = new BoxBounds(() => ({
    start: { x: 5, y: 5 },
    end: { x: 10, y: 10 },
  }));

  expect(bounds.globalWithin({ x: 0, y: 11 })).toBe(false);
});

test("relative start is always 0,0", () => {
  const bounds = new BoxBounds(() => ({
    start: { x: 0, y: 0 },
    end: { x: 10, y: 10 },
  }));

  expect(bounds.relativeStart).toEqual({ x: 0, y: 0 });
});

test("relative end is width,height", () => {
  const bounds = new BoxBounds(() => ({
    start: { x: 0, y: 0 },
    end: { x: 10, y: 10 },
  }));

  expect(bounds.relativeEnd).toEqual({ x: 10, y: 10 });
});

test("when recalculated it emits onRecalculate event", () => {
  let emittedOnRecalculate = false;

  const bounds = new BoxBounds(() => ({
    start: { x: 0, y: 0 },
    end: { x: 10, y: 10 },
  }));

  bounds.onRecalculate.subscribe(() => {
    emittedOnRecalculate = true;
  });

  bounds.recalculate();

  expect(emittedOnRecalculate).toBe(true);
});

test("when recalculated it updates global start and end", () => {
  let shellWidth = 10;
  let shellHeight = 10;

  const bounds = new BoxBounds(() => ({
    start: { x: shellWidth * 0.5, y: shellHeight * 0.5 },
    end: { x: shellWidth, y: shellHeight },
  }));

  expect(bounds.globalStart).toEqual({ x: 5, y: 5 });
  expect(bounds.globalEnd).toEqual({ x: 10, y: 10 });

  shellWidth = 20;
  shellHeight = 20;

  bounds.recalculate();

  expect(bounds.globalStart).toEqual({ x: 10, y: 10 });
  expect(bounds.globalEnd).toEqual({ x: 20, y: 20 });
});

test("when a box bounds parent recalculates, it recalculates as well", () => {
  let shellWidth = 10;
  let shellHeight = 10;

  const parentBounds = new BoxBounds(() => ({
    start: { x: shellWidth * 0.5, y: shellHeight * 0.5 },
    end: { x: shellWidth, y: shellHeight },
  }));

  const childBounds = BoxBounds.createRelativeBounds(
    parentBounds,
    { x: 1, y: 1 },
    { x: 1, y: 1 }
  );

  expect(childBounds.globalStart).toEqual({ x: 6, y: 6 });
  expect(childBounds.globalEnd).toEqual({ x: 9, y: 9 });

  shellWidth = 20;
  shellHeight = 20;

  parentBounds.recalculate();

  expect(childBounds.globalStart).toEqual({ x: 11, y: 11 });
  expect(childBounds.globalEnd).toEqual({ x: 19, y: 19 });
});
