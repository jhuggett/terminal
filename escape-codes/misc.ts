export enum MiscEscapeCode {
  EraseFromCursorToEndOfScreen = "0J",
  EraseFromCursorToBeginningOfScreen = "1J",
  EraseEntireScreen = "2J",
  EraseFromCursorToEndOfLine = "0K",
  EraseFromCursorToStartOfLine = "1K",
  EraseEntireLine = "2K",

  RequestCursorPosition = "6n",

  // Private Modes:
  MakeCursorInvisible = "?25l",
  MakeCursorVisible = "?25h",
  RestoreScreen = "?47l",
  SaveScreen = "?47h",
}
