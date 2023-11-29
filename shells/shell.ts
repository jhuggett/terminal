import { PointGrid } from "../point-stack-grids/point-stack-grid.ts";
import { XY } from "../xy.ts";
import { Element } from "../elements/element.ts";
import { Point, PointProperties } from "../points/point.ts";
import { Cursor } from "../cursors/cursor.ts";
import { BoxBounds } from "../bounds/box-bounds.ts";
import { render } from "../renderers/renderer.ts";
import { TargetMap, mouseEventNumberToType, userInput } from "../user-input.ts";
const clearScreen = `\u001b[2J`;
const hideCursor = `\u001b[?25l`;
const showCursor = `\u001b[?25h`;

const enableMouseTracking = `\u001b[?1003h\u001b[?1015h\u001b[?1006h`;
const stopMouseTracking = `\u001b[?1003l\u001b[?1015l\u001b[?1006l`;

export abstract class Shell {
  protected isRaw?: boolean;
  abstract setRaw(on: boolean): void;

  protected elementIDIncrement = 0;
  registerElement(element: Element<any>) {
    return {
      id: this.elementIDIncrement++,
    };
  }

  private cached_width?: number;
  get width() {
    if (this.cached_width === undefined) {
      this.cached_width = this.getShellSize().columns;
    }
    return this.cached_width;
  }

  private cached_height?: number;
  get height() {
    if (this.cached_height === undefined) {
      this.cached_height = this.getShellSize().rows;
    }
    return this.cached_height;
  }

  invalidateCachedSize() {
    this.cached_width = undefined;
    this.cached_height = undefined;
  }

  protected abstract getShellSize(): { rows: number; columns: number };

  protected abstract writeToStandardOut(contents: string): void;

  protected abstract readStandardIn(): Promise<Uint8Array>;

  abstract onWindowResize(onEvent: () => void): { stopListening: () => void };

  debugInfo() {
    return {
      width: this.width,
      height: this.height,
    };
  }

  get hasChangedPoints() {
    return this.pointGrid.hasChangedPoints;
  }

  private cursorIsShown?: boolean;
  showCursor(show: boolean) {
    if (this.cursorIsShown !== show) {
      if (show) {
        this.writeToStandardOut(showCursor);
      } else {
        this.writeToStandardOut(hideCursor);
      }
    }
    this.cursorIsShown = show;
  }

  handleMouseEvent({
    button,
    x,
    y,
    down,
  }: {
    button: number;
    x: number;
    y: number;
    down: boolean;
  }) {
    const stack = this.pointGrid.getStack({ x, y });
    if (!stack) return;

    for (const point of stack.stack) {
      const element = point.element;
      const result = element.inputMap.get(
        mouseEventNumberToType(button, down)
      )?.(element.bounds.toRelative({ x, y }));
      // does this make sense?
      if (result === "stop propagation") {
        break;
      }
    }
  }

  enableMouseTracking() {
    this.writeToStandardOut(enableMouseTracking);
  }

  disableMouseTracking() {
    this.writeToStandardOut(stopMouseTracking);
  }

  /**
   * Wait for keypress.
   */
  async keypress() {
    /*
      When a keys are pressed in quick succession, they can be buffered together.

      I'm not sure what makes the most sense here, but I think to start it makes
      sense to just read the first key in buffer.
    */

    const result = await this.readStandardIn();

    const utf8 = new TextDecoder("utf-8").decode(result);

    let mouseEvent = utf8.split("<")[1];
    if (mouseEvent) {
      const down = mouseEvent.endsWith("M");
      mouseEvent = mouseEvent.slice(0, -1);
      const [button, x, y] = mouseEvent.split(";");

      // 35 is mouse move
      // 0 is left click
      // 1 is wheel click
      // 64 is scroll up
      // 65 is scroll down

      // do something with the mouse event

      this.handleMouseEvent({
        button: parseInt(button),
        x: parseInt(x) - 1,
        y: parseInt(y) - 1,
        down,
      });

      return [];
    }

    if (result.length === 0)
      throw new Error("Received empty buffer for keypress");

    if (result[0] === 27) {
      if (result.length > 3) {
        const escapedResult = [result[0]];
        let i = 1;
        while (result[i] !== 27 && i < result.length) {
          escapedResult.push(result[i]);
          i++;
        }
        return escapedResult;
      }
      return result;
    }

    if (result.length > 1) {
      return result.slice(0, 1);
    }

    return result;
  }

  // findPoint(coordinate: XY, z: KDIndex) {
  //   return this.pointGrid.find(coordinate, z);
  // }

  // copyPointGrid() {
  //   return this.pointGrid.copy();
  // }

  loadPointGrid(pointGrid: PointGrid) {
    this.pointGrid = pointGrid;
  }

  protected pointGrid: PointGrid = new PointGrid();

  /**
   * Writes the point to the grid of point stacks.
   */
  bufferedWrite(point: Point) {
    this.pointGrid.set(point);
  }

  /**
   * Uses the clear screen escape code.
   * Discards any noted changes.
   */
  clear() {
    this.pointGrid = new PointGrid();
    this.writeToStandardOut(clearScreen);
    //this.pointGrid.reset();
  }

  /**
   * Clear buffer at coordinate and z index.
   */
  // bufferedClear(coordinate: XY, z: KDIndex) {
  //   this.pointGrid.clear(coordinate, z);
  // }

  /**
   * Render buffered changes to the terminal.
   */
  render() {
    const points = this.pointGrid.flushChangedPoints();

    let content = render(points, this.decorativeCursorLocation);

    // write in batches to support Window's max line length
    const chunkSize = 250;
    for (let i = 0; i < content.length; i += chunkSize) {
      this.writeToStandardOut(content.slice(i, i + chunkSize).join(""));
    }
  }

  private lastCursorPosition: XY | null = null;
  private isLastCursorPositionValid = false;
  async getCursorPosition(): Promise<XY> {
    if (this.isLastCursorPositionValid && this.lastCursorPosition) {
      return this.lastCursorPosition;
    }

    this.writeToStandardOut(`\u001b[6n`);

    const buf = await this.readStandardIn();

    // ESC[n;mR where n is the row and m is the column
    const output = new TextDecoder().decode(buf);
    const [left, right] = output.split(";");

    if (!right) {
      // Hacky fix for spamming keys causing it to read user input instead
      return this.getCursorPosition();
    }

    const row = left.split("[")[1];
    const column = right.slice(0, -1);

    this.lastCursorPosition = {
      y: parseInt(row),
      x: parseInt(column),
    };
    this.isLastCursorPositionValid = true;
    return this.lastCursorPosition;
  }

  rootElement: Element<null> = new Element(
    this,
    new BoxBounds(() => {
      return {
        start: {
          x: 0,
          y: 0,
        },
        end: {
          x: this.width,
          y: this.height,
        },
      };
    }, null),
    null,
    undefined
  );

  setPoint(point: Point) {
    if (
      point.location.x < 0 ||
      point.location.y < 0 ||
      point.location.x >= this.width ||
      point.location.y >= this.height
    ) {
      // Maybe throw an out of bounds error?
      return;
    }
    this.pointGrid.set(point);
  }

  removeAllPointsForElement(element: Element<any>) {
    this.pointGrid.removeAllPointsForElement(element);
  }

  removeElementAtXY(xy: XY, element: Element<any>) {
    this.pointGrid.removeElementAtXY(xy, element);
  }

  focusedElement?: Element<any>;

  focusOn(element: Element<any>) {
    if (this.focusedElement) {
      this.focusedElement.onBlur.emit(this.focusedElement);
    }
    this.focusedElement = element;
    this.focusedElement.onFocus.emit(this.focusedElement);
  }

  async userInteraction() {
    if (!this.focusedElement) return;
    let targetMaps: TargetMap[] = [];
    let el: Element<any> | undefined = this.focusedElement;
    while (!!el) {
      targetMaps.push(el.inputMap);
      el = el.parent;
    }

    await userInput(this, targetMaps);
  }

  clearWithinBounds(bounds: BoxBounds<any>, z: number) {
    this.pointGrid.clearWithinBounds(bounds, z);
  }

  decorativeCursorLocation?: XY;

  /**
  This controls where the cursor ends up after each render.
  */
  setDecorativeCursorLocation(location: XY) {
    this.decorativeCursorLocation = location;
  }
}
