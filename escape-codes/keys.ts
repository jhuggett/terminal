export const isLowercaseLetter = (key: number[]) => {
  if (key.length !== 1) return false;
  const [num] = key;
  if (num > 96 && num < 123) return true;
  return false;
};

export const isUppercaseLetter = (key: number[]) => {
  if (key.length !== 1) return false;
  const [num] = key;
  if (num > 64 && num < 91) return true;
  return false;
};

export const isLowercaseOrUppercaseLetter = (key: number[]) => {
  return isLowercaseLetter(key) || isUppercaseLetter(key);
};

export const isNumber = (key: number[]) => {
  if (key.length !== 1) return false;
  const [num] = key;
  if (num > 47 && num < 58) return true;
  return false;
};

export const isSymbol = (key: number[]) => {
  if (key.length !== 1) return false;
  const [num] = key;
  if (num === 32) return false; // that's the space key
  if (num > 31 && num < 48) return true;
  if (num > 57 && num < 65) return true;
  if (num > 90 && num < 97) return true;
  if (num > 122 && num < 127) return true;
  return false;
};

export const isCharacter = (key: number[]) => {
  return (
    isLowercaseLetter(key) ||
    isUppercaseLetter(key) ||
    isNumber(key) ||
    isSymbol(key)
  );
};

export const Keys = {
  "97": "a",
  "65": "A",
  "98": "b",
  "66": "B",
  "99": "c",
  "67": "C",
  "100": "d",
  "68": "D",
  "101": "e",
  "69": "E",
  "102": "f",
  "70": "F",
  "103": "g",
  "71": "G",
  "104": "h",
  "72": "H",
  "105": "i",
  "73": "I",
  "106": "j",
  "74": "J",
  "107": "k",
  "75": "K",
  "108": "l",
  "76": "L",
  "109": "m",
  "77": "M",
  "110": "n",
  "78": "N",
  "111": "o",
  "79": "O",
  "112": "p",
  "80": "P",
  "113": "q",
  "81": "Q",
  "114": "r",
  "82": "R",
  "115": "s",
  "83": "S",
  "116": "t",
  "84": "T",
  "117": "u",
  "85": "U",
  "118": "v",
  "86": "V",
  "119": "w",
  "87": "W",
  "120": "x",
  "88": "X",
  "121": "y",
  "89": "Y",
  "122": "z",
  "90": "Z",

  "49": "1",
  "50": "2",
  "51": "3",
  "52": "4",
  "53": "5",
  "54": "6",
  "55": "7",
  "56": "8",
  "57": "9",
  "48": "0",

  "126": "~",
  "96": "`",
  "33": "!",
  "64": "@",
  "35": "#",
  "36": "$",
  "37": "%",
  "94": "^",
  "38": "&",
  "42": "*",
  "40": "(",
  "41": ")",
  "95": "_",
  "45": "-",
  "43": "+",
  "61": "=",
  "123": "{",
  "91": "[",
  "125": "}",
  "93": "]",
  "124": "|",
  "92": "\\",
  "58": ":",
  "59": ";",
  "34": '"',
  "39": "'",
  "60": "<",
  "44": ",",
  "62": ">",
  "46": ".",
  "63": "?",
  "47": "/",

  "27": "Escape",
  "9": "Tab",
  "32": "Space",
  "13": "Enter",
  "8": "Backspace",
  "127": "Delete",

  "27.91.65": "Arrow Up",
  "27.91.67": "Arrow Right",
  "27.91.66": "Arrow Down",
  "27.91.68": "Arrow Left",
} as const;

export type Key = (typeof Keys)[keyof typeof Keys];
