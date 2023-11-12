import { type } from "os";
import {
  isCharacter,
  isLowercaseLetter,
  isLowercaseOrUppercaseLetter,
  isNumber,
  isSymbol,
  isUppercaseLetter,
  Key,
  Keys,
} from "./escape-codes/keys.ts";
import { Shell } from "./shells/shell.ts";
import { XY } from "./xy.ts";

const isAvailableKeyCode = (code: string): code is keyof typeof Keys => {
  return Object.keys(Keys).includes(code as Key);
};

export class UnknownKeyCodeError extends Error {}

type AnyNumberKey = "Any number";

type AnyStringKey =
  | "Any lowercase letter"
  | "Any uppercase letter"
  | "Any letter"
  | "Any symbol"
  | "Any character"
  | "Any key";

type InputInformation = {
  key: string;
};

export type MouseEvent = {
  type: MouseEventType;
  x: number;
  y: number;
};

// 35 is mouse move
// 0 is left click
// 1 is wheel click
// 64 is scroll up
// 65 is scroll down

export const mouseEventNumberToType = (
  num: number,
  down: boolean
): MouseEventType => {
  switch (num) {
    case 35:
      return "Mouse move";
    case 32:
      return down ? "Mouse drag" : "Mouse move";
    case 0:
      return down ? "Mouse down" : "Mouse up";
    case 1:
      return down ? "Wheel down" : "Wheel up";
    case 64:
      return "Scroll up";
    case 65:
      return "Scroll down";
    default:
      throw new Error(`Unknown mouse event number: ${num}`);
  }
};

type MouseEventType =
  | "Mouse down"
  | "Mouse up"
  | "Mouse move"
  | "Mouse drag"
  | "Wheel up"
  | "Wheel down"
  // | "Mouse enter"
  // | "Mouse leave"
  | "Scroll up"
  | "Scroll down";

export type TargetKey = Key | AnyStringKey | AnyNumberKey | MouseEventType;

type CallbackReturn = void | "stop propagation";

type StringCallback = (key: string) => CallbackReturn;
type NumberCallback = (key: number) => CallbackReturn;
type MouseEventCallback = (event: XY) => CallbackReturn;
type KeyCallback = () => CallbackReturn;
export type TargetCallback<T> = T extends AnyStringKey
  ? StringCallback
  : T extends AnyNumberKey
  ? NumberCallback
  : T extends MouseEventType
  ? MouseEventCallback
  : KeyCallback;

export class TargetMap {
  map: Map<TargetKey, TargetCallback<TargetKey>> = new Map();

  on<T extends TargetKey>(key: T, callback: TargetCallback<T>) {
    this.map.set(key, callback);
  }

  get<T extends TargetKey>(key: T): TargetCallback<T> | undefined {
    return this.map.get(key) as TargetCallback<T> | undefined;
  }
}

export type UserInputTargets = Partial<
  Record<TargetKey, TargetCallback<TargetKey>>
>;

export const userInput = async (shell: Shell, targetMaps: TargetMap[]) => {
  const bytes = await shell.keypress();
  const byteArray = Array.from(bytes.values());

  if (byteArray.length === 0) {
    return;
  }

  const stringRepresentation = byteArray
    .map((byte) => byte.toString())
    .join(".");

  if (!isAvailableKeyCode(stringRepresentation)) {
    throw new UnknownKeyCodeError(`Unknown Key Code: ${bytes}`);
  }

  const key = Keys[stringRepresentation];

  for (const targetMap of targetMaps) {
    const specificTarget = targetMap.get(key);
    if (specificTarget) {
      if (specificTarget() === "stop propagation") {
        return;
      } else {
        continue;
      }
    }

    const anyLowercaseLetter = targetMap.get("Any lowercase letter");
    if (anyLowercaseLetter && isLowercaseLetter(byteArray)) {
      if (anyLowercaseLetter(key) === "stop propagation") {
        return;
      } else {
        continue;
      }
    }

    const anyUppercaseLetter = targetMap.get("Any uppercase letter");
    if (anyUppercaseLetter && isUppercaseLetter(byteArray)) {
      if (anyUppercaseLetter(key) === "stop propagation") {
        return;
      } else {
        continue;
      }
    }

    const anyLetter = targetMap.get("Any letter");
    if (anyLetter && isLowercaseOrUppercaseLetter(byteArray)) {
      if (anyLetter(key) === "stop propagation") {
        return;
      } else {
        continue;
      }
    }

    const anyNumber = targetMap.get("Any number");
    if (anyNumber && isNumber(byteArray)) {
      if (anyNumber(parseInt(key)) === "stop propagation") {
        return;
      } else {
        continue;
      }
    }

    const anySymbol = targetMap.get("Any symbol");
    if (anySymbol && key.length === 1 && isSymbol(byteArray)) {
      if (anySymbol(key) === "stop propagation") {
        return;
      } else {
        continue;
      }
    }

    const anyCharacter = targetMap.get("Any character");
    if (anyCharacter && isCharacter(byteArray)) {
      if (anyCharacter(key) === "stop propagation") {
        return;
      } else {
        continue;
      }
    }

    const anyKey = targetMap.get("Any key");
    if (anyKey) {
      if (anyKey(key) === "stop propagation") {
        return;
      } else {
        continue;
      }
    }
  }
};
