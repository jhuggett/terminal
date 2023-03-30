import { CompoundZIndex, moveTo, Point, rendering } from "../point.ts";
import { PointGrid } from "../point-grid.ts";
import { Box } from "../layers/box.ts";
import { XY } from "../xy.ts";

const clearScreen = `\u001b[2J`;
const hideCursor = `\u001b[?25lm`;
const showCursor = `\u001b[?25hm`;

export abstract class Shell {
  protected isRaw?: boolean;
  abstract setRaw(on: boolean): void;

  abstract get width(): number;
  abstract get height(): number;

  protected abstract writeToStandardOut(contents: string): void;

  protected abstract readStandardIn(): Promise<Uint8Array>;

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

  /**
   * Wait for keypress.
   */
  keypress() {
    return this.readStandardIn();
  }

  findPoint(coordinate: XY, zIndex: CompoundZIndex) {
    return this.pointGrid.find(coordinate, zIndex);
  }

  protected pointGrid: PointGrid = new PointGrid();

  /**
   * Writes the point to the grid of point stacks.∂
   */
  bufferedWrite(point: Point) {
    this.pointGrid.set(point);
  }

  /**
   * Uses the clear screen escape code.
   * Discards any noted changes.
   */
  clear() {
    this.writeToStandardOut(clearScreen);
    this.pointGrid.reset();
  }

  /**
   * Clear buffer at coordinate and z index.
   */
  bufferedClear(coordinate: XY, zIndex: CompoundZIndex) {
    this.pointGrid.clear(coordinate, zIndex);
  }

  /**
   * Render buffered changes to the terminal.
   */
  render() {
    let content = "";

    for (const {
      point,
      coordinate: { x, y },
    } of this.pointGrid.getChangedPoints()) {
      content += point ? rendering(point) : moveTo(x, y) + " ";
    }

    this.writeToStandardOut(content);
    this.pointGrid.flushNotedChanges();
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

  getBoxRepresentation() {
    return new Box({
      computedOrConstantWidth: () => this.width,
      computedOrConstantHeight: () => this.height,
      computedOrConstantXOffset: 0,
      computedOrConstantYOffset: 0,
      shell: this,
      zIndex: new CompoundZIndex([0]),
    });
  }
}
