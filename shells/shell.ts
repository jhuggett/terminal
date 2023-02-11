export function positionsAreTheSame(a: CursorPosition, b: CursorPosition) {
  return a.row === b.row && a.column === b.column
}

export interface CursorPosition {
  row: number
  column: number
}

export interface Shell {
  keypress: () => Promise<Uint8Array>
  write: (str: string) => void
  getCursorPosition: () => Promise<CursorPosition>
  setRaw: (on: boolean) => void
}