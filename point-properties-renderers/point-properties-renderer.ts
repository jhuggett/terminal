// // the +1s account for the term origin being 1,1
// export const moveTo = (x: number, y: number) => `\u001b[${y + 1};${x + 1}H`;
// const setForegroundColor = (r: number, g: number, b: number) =>
//   `\u001b[38;2;${Math.min(255, Math.max(0, Math.round(r)))};${Math.min(
//     255,
//     Math.max(0, Math.round(g))
//   )};${Math.min(255, Math.max(0, Math.round(b)))}m`;
// const setBackgroundColor = (r: number, g: number, b: number) =>
//   `\u001b[48;2;${Math.min(255, Math.max(0, Math.round(r)))};${Math.min(
//     255,
//     Math.max(0, Math.round(g))
//   )};${Math.min(255, Math.max(0, Math.round(b)))}m`;
// const reset = `\u001b[0m`;

// export const rendering = (point: Point, pointStack: PointStack) => {
//   const { x, y } = point.location;
//   let piece = moveTo(x, y);
//   let styled = false;
//   if (point) {
//     let foregroundColor = point.foregroundColor;
//     if (!foregroundColor) {
//       /* Making the assumption that this point is the highest point */
//       let i = pointStack.stack.length - 2;
//       while (!foregroundColor && i > -1) {
//         const lowerPoint = pointStack.stack[i];
//         if (lowerPoint.foregroundColor)
//           foregroundColor = lowerPoint.foregroundColor;
//         i--;
//       }
//     }
//     if (foregroundColor) {
//       piece += setForegroundColor(
//         foregroundColor.r,
//         foregroundColor.g,
//         foregroundColor.b
//       );
//       styled = true;
//     }
//     let backgroundColor = point.backgroundColor;
//     if (!backgroundColor) {
//       /* Making the assumption that this point is the highest point */
//       let i = pointStack.stack.length - 2;
//       while (!backgroundColor && i > -1) {
//         const lowerPoint = pointStack.stack[i];
//         if (lowerPoint.backgroundColor)
//           backgroundColor = lowerPoint.backgroundColor;
//         i--;
//       }
//     }
//     if (backgroundColor) {
//       piece += setBackgroundColor(
//         backgroundColor.r,
//         backgroundColor.g,
//         backgroundColor.b
//       );
//       styled = true;
//     }
//     piece += point.character;
//   } else {
//     piece += " ";
//   }
//   if (styled) {
//     piece += reset;
//   }
//   return piece;
// };
