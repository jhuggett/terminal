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

/*

target map merging & target chaining

*/

type TargetKey = Key | OtherUserInputKeys
type TargetCallback = (info: InputInformation) => void | 'stop propagation'

class TargetChain {
   constructor(private links: TargetCallback[]) {

   }

  execute(info: InputInformation) {
    for (const link of this.links) {
      const result = link(info) 
      // on receiving a truthy response, stop executing the chain
      if (result === 'stop propagation') return
    }
  }

  push(chain: TargetChain) {
    this.links.push(...chain.links)
  }
}

export class TargetMap {
  map: Map<TargetKey, TargetChain> = new Map()

  constructor(targets: UserInputTargets) {
    Object.entries(targets).forEach(([key, value]) => {
      this.map.set(key as TargetKey, new TargetChain([value]))
    })
  }

  merge = (other: TargetMap) => {
    other.map.forEach((chain, key) => {
      const existingChain = this.map.get(key)
      if (existingChain) {
        existingChain.push(chain)
      } else {
        this.map.set(key, chain)
      }
    })
  }
}

export type UserInputTargets = Partial<
  Record<TargetKey, TargetCallback>
>

export const userInput = async (
  shell: Shell,
  targetMap: TargetMap
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

  const specificTarget = targetMap.map.get(key);
  if (specificTarget) return specificTarget.execute(info);

  const anyLowercaseCharacter = targetMap.map.get("Any lowercase character");
  if (anyLowercaseCharacter && isLowercaseCharacter(byteArray)) {
    return anyLowercaseCharacter.execute(info);
  }

  const anyUppercaseCharacter = targetMap.map.get("Any uppercase character");
  if (anyUppercaseCharacter && isUppercaseCharacter(byteArray)) {
    return anyUppercaseCharacter.execute(info);
  }

  const anyCharacter = targetMap.map.get("Any character");
  if (anyCharacter && isLowercaseOrUppercaseCharacter(byteArray)) {
    return anyCharacter.execute(info);
  }

  const anyKey = targetMap.map.get("Any key");
  if (anyKey) return anyKey.execute(info);
};
