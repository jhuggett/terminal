import { Box } from "../box.ts";
import { Cursor } from "../cursor.ts";
import { MiscEscapeCode } from "../escape-codes/misc.ts";
import { ESCAPE_CODE } from "../escape-codes/prefix.ts";
import { CursorPosition, Shell } from "./shell.ts"

export class DenoShell implements Box, Shell {

  /**
   * Creates a shell and cursor. Enables raw mode by default.
   */
  static init() {
    const shell = new DenoShell()
    const cursor = new Cursor(shell, shell)

    shell.setRaw(true)

    return {
      shell,
      cursor
    }
  }

  get width() {
    return Deno.consoleSize(Deno.stdout.rid).columns
  }

  get height() {
    return Deno.consoleSize(Deno.stdout.rid).rows
  }

  private async readStandardIn() {
    const { stdin } = Deno

    const buf = new Uint8Array(100)
    const bytesRead = await stdin.read(buf) || 0
    const filledBuf = buf.slice(0, bytesRead)

    return filledBuf
  }

  keypress() : Promise<Uint8Array> {
    return this.readStandardIn()
  }

  write(str: string) {
    Deno.stdout.writeSync(new TextEncoder().encode(str))
    this.isLastCursorPositionValid = false
  }

  private lastCursorPosition: CursorPosition | null = null
  private isLastCursorPositionValid = false
  async getCursorPosition(): Promise<CursorPosition> {
    if (this.isLastCursorPositionValid && this.lastCursorPosition) return this.lastCursorPosition
    this.write(`${ESCAPE_CODE}${MiscEscapeCode.RequestCursorPosition}`)

    const buf = await this.readStandardIn()

    // ESC[n;mR where n is the row and m is the column
    const output = new TextDecoder().decode(buf)
    const [left, right] = output.split(';')
    
    if (!right) { // Hacky fix for spamming keys causing it to read user input instead
      return this.getCursorPosition()
    }

    const row = left.split('[')[1]
    const column = right.slice(0, -1)

    this.lastCursorPosition = {
      row: parseInt(row),
      column: parseInt(column)
    }
    this.isLastCursorPositionValid = true
    return this.lastCursorPosition
  }

  setRaw(on: boolean) {
    Deno.stdin.setRaw(on)
  }
}