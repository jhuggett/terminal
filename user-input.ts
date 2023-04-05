import {
  isLowercaseCharacter,
  isLowercaseOrUppercaseCharacter,
  isUppercaseCharacter,
  Key,
  Keys,
} from "./escape-codes/keys.ts";
import { Shell } from "./shells/shell.ts";

const isAvailableKeyCode = (code: string): code is keyof typeof Keys => {
  return Object.keys(Keys).includes(code as Key);
};

export class UnknownKeyCodeError extends Error {}

type OtherUserInputKeys =
  | "Any lowercase character"
  | "Any uppercase character"
  | "Any character"
  | "Any key";

type InputInformation = {
  key: string;
};

export const userInput = async (
  shell: Shell,
  targets: Partial<
    Record<Key | OtherUserInputKeys, (info: InputInformation) => void>
  >
) => {
  const bytes = await shell.keypress();
  const byteArray = Array.from(bytes.values());
  const stringRepresentation = byteArray
    .map((byte) => byte.toString())
    .join(".");

  if (!isAvailableKeyCode(stringRepresentation)) {
    /*
      The bytes returned from shell.keypress() can contain more than one keypress.
      This can happen if the user spams multiple keys.

      Given the current implementation, it doesn't know how to read it.
      We might be able to try to split out the different keys,
      but that might be more work than it's worth.

      For now, throw this error that the user can catch.
      Seems to work well enough.
    */
    throw new UnknownKeyCodeError(`Unknown Key Code: ${bytes}`);
  }

  const key = Keys[stringRepresentation];

  const info: InputInformation = {
    key,
  };

  const specificTarget = targets[key];
  if (specificTarget) return specificTarget(info);

  const anyLowercaseCharacter = targets["Any lowercase character"];
  if (anyLowercaseCharacter && isLowercaseCharacter(byteArray)) {
    return anyLowercaseCharacter(info);
  }

  const anyUppercaseCharacter = targets["Any uppercase character"];
  if (anyUppercaseCharacter && isUppercaseCharacter(byteArray)) {
    return anyUppercaseCharacter(info);
  }

  const anyCharacter = targets["Any character"];
  if (anyCharacter && isLowercaseOrUppercaseCharacter(byteArray)) {
    return anyCharacter(info);
  }

  const anyKey = targets["Any key"];
  if (anyKey) return anyKey(info);
};
