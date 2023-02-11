import { isLowercaseCharacter, isLowercaseOrUppercaseCharacter, isUppercaseCharacter } from "./escape-codes/keys.ts"
import { Key } from "./export.ts";
import { Shell } from "./shells/shell.ts"

type AvailibleKeyCode = typeof Key[keyof typeof Key]

const isAvailibleKeyCode = (code: string) : code is AvailibleKeyCode => {
  return Object.values(Key).includes(code as AvailibleKeyCode)
}

const ERROR_CODES = {
  unkownKeyCode: 'unknown-key-code'
}

class UnkownKeyCodeError extends Error {
  errorCode = ERROR_CODES.unkownKeyCode
  constructor(msg: string) {
    super(msg)
  }
}

export const isUnkownKeyCodeError = (err: any): err is UnkownKeyCodeError => {
  return err.errorCode === ERROR_CODES.unkownKeyCode
}

export const userInput = async (shell: Shell, targets: {
  specific?: Map<AvailibleKeyCode, () => void>
  lowercaseCharacter?: (character: string) => void
  uppercaseCharacter?: (character: string) => void
  anyCharacter?: (character: string) => void
  any?: () => void
}) => {
  const bytes = await shell.keypress()

  const byteArray = Array.from(bytes.values())
  const stringRepresentation = byteArray.map(byte => byte.toString()).join('.')

  if (!isAvailibleKeyCode(stringRepresentation)) {
    /*
      The bytes returned from shell.keypress() can contain more than one keypress.
      This can happen if the user spams multiple keys.

      Given the current implementation, it doesn't know how to read it.
      We might be able to try to split out the different keys,
      but that might be more work than it's worth.

      For now, throw this error that the user can catch.
      Seems to work well enough.
    */
    throw new UnkownKeyCodeError(`Unknown Key Code: ${bytes}`)
  }

  const specificTarget = targets.specific?.get(stringRepresentation)
  if (specificTarget) return specificTarget()

  if (targets.lowercaseCharacter && isLowercaseCharacter(byteArray)) {
    return targets.lowercaseCharacter((new TextDecoder()).decode(bytes))
  }

  if (targets.uppercaseCharacter && isUppercaseCharacter(byteArray)) {
    return targets.uppercaseCharacter((new TextDecoder()).decode(bytes))
  }

  if (targets.anyCharacter && isLowercaseOrUppercaseCharacter(byteArray)) {
    return targets.anyCharacter((new TextDecoder()).decode(bytes))
  }

  if (targets.any) return targets.any()
}
