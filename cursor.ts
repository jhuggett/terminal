import { Box } from "./box.ts";
import { MiscEscapeCode } from "./escape-codes/misc.ts";
import { ESCAPE_CODE } from "./escape-codes/prefix.ts";
import { CursorPosition, positionsAreTheSame, Shell } from "./shells/shell.ts";

export class Cursor {

  constructor(public shell: Shell, public box: Box) {}

  private instructionBuffer: IntructionBuffer = new IntructionBuffer()

  write(str: string) {
    this.instructionBuffer.append(Content.str(str))
  }

  async writeAndRender(str: string) {
    this.write(str)
    await this.render()
  }

  /**
   * Remember, the top left corner is **column 1 and row 1**; counts start at 1, not 0. 
   */
  moveTo(column: number, row: number) {
    this.instructionBuffer.append(Move.to(column, row))
  }

  lastKnowPosition: CursorPosition | null = null

  async render() {
    const currentPosition = await this.shell.getCursorPosition()
    if (!this.lastKnowPosition) {
      this.lastKnowPosition = currentPosition
    } else if (!positionsAreTheSame(currentPosition, this.lastKnowPosition)) {
      this.instructionBuffer.prepend(Move.to(this.lastKnowPosition.column, this.lastKnowPosition.row))
    }

    this.instructionBuffer.flush(this.shell)
  }
}

interface Instruction {
  writableContent: string
}


class Move implements Instruction {
  constructor(public writableContent: string) {}

  static to(column: number, row: number) {
    return new Move(ESCAPE_CODE + `${row};${column}H`)
  }
}

class Content implements Instruction {
  constructor(public content: string) {}

  static str(str: string) {
    return new Content(str)
  }

  static clearScrean() {
    return new Content(ESCAPE_CODE + MiscEscapeCode.EraseEntireScreen)
  }

  get writableContent() {
    return this.content
  }
}

class IntructionBuffer {
  private buffer: Instruction[] = []

  append(instruction: Instruction) {
    this.buffer.push(instruction)
  }

  prepend(instruction: Instruction) {
    this.buffer = [instruction, ...this.buffer]
  }

  flush(shell: Shell) {
    shell.write(this.buffer.map(instruction => instruction.writableContent).join(''))
    this.buffer = []
  }
}