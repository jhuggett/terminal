import { Point } from "../points/point";
import { XY } from "../xy";

// the +1s account for the term origin being 1,1
export const moveTo = (x: number, y: number) => `\u001b[${y + 1};${x + 1}H`;
const setForegroundColor = (r: number, g: number, b: number) =>
  `\u001b[38;2;${Math.min(255, Math.max(0, Math.round(r)))};${Math.min(
    255,
    Math.max(0, Math.round(g))
  )};${Math.min(255, Math.max(0, Math.round(b)))}m`;
const setBackgroundColor = (r: number, g: number, b: number) =>
  `\u001b[48;2;${Math.min(255, Math.max(0, Math.round(r)))};${Math.min(
    255,
    Math.max(0, Math.round(g))
  )};${Math.min(255, Math.max(0, Math.round(b)))}m`;
const reset = `\u001b[0m`;
const bold = `\u001b[1m`;
const underline = `\u001b[4m`;
const italic = `\u001b[3m`;

export function render(
  points: Point[],
  decorativeCursorLocation?: XY
): string[] {
  const chunks = [];
  let lastConfig = "";
  let lastX: number | undefined = undefined;
  let lastY: number | undefined = undefined;

  for (const point of points) {
    let config: string = "";
    let nextChunk = "";

    if (point.properties.foregroundColor) {
      config += setForegroundColor(
        point.properties.foregroundColor.r,
        point.properties.foregroundColor.g,
        point.properties.foregroundColor.b
      );
    }

    if (point.properties.backgroundColor) {
      config += setBackgroundColor(
        point.properties.backgroundColor.r,
        point.properties.backgroundColor.g,
        point.properties.backgroundColor.b
      );
    }

    if (point.properties.bold) {
      config += bold;
    }

    if (point.properties.italic) {
      config += italic;
    }

    if (point.properties.underline) {
      config += underline;
    }

    const lastXExists = lastX !== undefined;
    const lastYExists = lastY !== undefined;
    const isNextToLastPoint =
      lastX !== undefined &&
      lastY === point.location.y &&
      lastX + 1 === point.location.x;
    if (!lastXExists || !lastYExists || !isNextToLastPoint) {
      nextChunk += moveTo(point.location.x, point.location.y);
    }

    lastX = point.location.x;
    lastY = point.location.y;

    if (config !== lastConfig) {
      nextChunk += reset;
      nextChunk += config;
      lastConfig = config;
    }

    nextChunk += point.character;

    chunks.push(nextChunk);
  }

  //return moveTo(0, 0) + reset + content + reset + moveTo(0, 0);

  //chunks.push(moveTo(0, 0));

  chunks.push(reset);

  if (decorativeCursorLocation) {
    chunks.push(moveTo(decorativeCursorLocation.x, decorativeCursorLocation.y));
  }

  return chunks;

  //  console.log("length", chunks.length);

  return [];
}
