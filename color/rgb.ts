export interface RGB {
  r: number;
  g: number;
  b: number;
  a: number;
}

export function rgb(r: number, g: number, b: number, a = 1): RGB {
  return { r, g, b, a };
}

export function equalRGBs(a?: RGB, b?: RGB) {
  if (!a && !b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
}

export function mergeRBGs(primary: RGB, secondary: RGB) {
  return rgb(
    Math.round(primary.r * primary.a + secondary.r * (1 - primary.a)),
    Math.round(primary.g * primary.a + secondary.g * (1 - primary.a)),
    Math.round(primary.b * primary.a + secondary.b * (1 - primary.a))
  );
}

export const red = (brightness = 1, opacity = 1) =>
  rgb(Math.round(brightness * 255), 0, 0, opacity);
export const green = (brightness = 1, opacity = 1) =>
  rgb(0, Math.round(brightness * 255), 0, opacity);
export const blue = (brightness = 1, opacity = 1) =>
  rgb(0, 0, Math.round(brightness * 255), opacity);
export const yellow = (brightness = 1, opacity = 1) =>
  rgb(Math.round(brightness * 255), Math.round(brightness * 255), 0, opacity);
export const magenta = (brightness = 1, opacity = 1) =>
  rgb(Math.round(brightness * 255), 0, Math.round(brightness * 255), opacity);
export const cyan = (brightness = 1, opacity = 1) =>
  rgb(0, Math.round(brightness * 255), Math.round(brightness * 255), opacity);
export const white = (brightness = 1, opacity = 1) =>
  rgb(
    Math.round(brightness * 255),
    Math.round(brightness * 255),
    Math.round(brightness * 255),
    opacity
  );
export const black = (opacity = 1) => rgb(0, 0, 0, opacity);
export const gray = (brightness = 1, opacity = 1) =>
  rgb(
    Math.round(brightness * 128),
    Math.round(brightness * 128),
    Math.round(brightness * 128),
    opacity
  );
