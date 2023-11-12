import { expect, test } from "bun:test";
import { Cursor } from "./cursor";
import { BoxBounds } from "../bounds/box-bounds";

const bounds = new BoxBounds(() => ({
  start: { x: 0, y: 0 },
  end: { x: 10, y: 10 },
}));

test("starting location is always 0,0", () => {
  const cursor = new Cursor(bounds);

  expect(cursor.location).toEqual({ x: 0, y: 0 });
});

test("can move up", () => {
  const cursor = new Cursor(bounds);

  cursor.location = { x: 0, y: 1 };

  cursor.moveUp();

  expect(cursor.location).toEqual({ x: 0, y: 0 });
});

test("can move down", () => {
  const cursor = new Cursor(bounds);

  cursor.moveDown();

  expect(cursor.location).toEqual({ x: 0, y: 1 });
});

test("can move left", () => {
  const cursor = new Cursor(bounds);

  cursor.location = { x: 1, y: 0 };

  cursor.moveLeft();

  expect(cursor.location).toEqual({ x: 0, y: 0 });
});

test("can move right", () => {
  const cursor = new Cursor(bounds);

  cursor.moveRight();

  expect(cursor.location).toEqual({ x: 1, y: 0 });
});

test("can move to", () => {
  const cursor = new Cursor(bounds);

  cursor.moveTo({ x: 1, y: 1 });

  expect(cursor.location).toEqual({ x: 1, y: 1 });
});

test("cannot move up if at topmost", () => {
  const cursor = new Cursor(bounds);

  expect(() => cursor.moveUp()).toThrow("Cannot move cursor up.");
});

test("cannot move down if at bottommost", () => {
  const cursor = new Cursor(bounds);

  cursor.moveTo({ x: 0, y: 10 });

  expect(() => cursor.moveDown()).toThrow("Cannot move cursor down.");
});

test("cannot move left if at leftmost", () => {
  const cursor = new Cursor(bounds);

  expect(() => cursor.moveLeft()).toThrow("Cannot move cursor left.");
});

test("cannot move right if at rightmost", () => {
  const cursor = new Cursor(bounds);

  cursor.moveTo({ x: 10, y: 0 });

  expect(() => cursor.moveRight()).toThrow("Cannot move cursor right.");
});

test("cannot move to location outside of bounds", () => {
  const cursor = new Cursor(bounds);

  expect(() => cursor.moveTo({ x: 11, y: 11 })).toThrow(
    "Cannot move cursor to requested location."
  );
});
