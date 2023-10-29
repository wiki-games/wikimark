export type Code = number;

export const codes = {
  eolCR: -7, //            <end of line: \r>
  eolLF: -6, //            <end of line: \n>
  eolCRLF: -5, //          <end of line: \r\n>
  sof: -4, //              <start of file>
  eof: -3, //              <end of file>
  horizontalTab: -2, //    <single-space tab character: \t>
  virtualSpace: -1, //     <extra spaces created by a tab character>

  lineFeed: 0x0a,
  carriageReturn: 0x0d,
  space: 32, //            <space>
  exclamationMark: 33, //  !
  quoteDouble: 34, //      "
  numberSign: 35, //       #
  dollarSign: 36, //       $
  percentSign: 37, //      %
  ampersand: 38, //        &
  quoteSingle: 39, //      '
  parenthesisLeft: 40, //  (
  parenthesisRight: 41, // )
  asterisk: 42, //         *
  plusSign: 43, //         +
  comma: 44, //            ,
  hyphen: 45, //           -
  period: 46, //           .
  slash: 47, //            /
  colon: 58, //            :
  semicolon: 59, //        ;
  lessThanSign: 60, //     <
  equalSign: 61, //        =
  greaterThanSign: 62, //  >
  questionMark: 63, //     ?
  atSign: 64, //           @
  bracketLeft: 91, //      [
  backslash: 92, //        \
  bracketRight: 93, //     ]
  caret: 94, //            ^
  underscore: 95, //       _
  backtick: 96, //         `
  braceLeft: 123, //       {
  verticalBar: 124, //     |
  braceRight: 125, //      }
  tilde: 126, //           ~
  nbsp: 160, //            <non-breaking space>

  digit0: 48,
  digit1: 49,
  digit2: 50,
  digit3: 51,
  digit4: 52,
  digit5: 53,
  digit6: 54,
  digit7: 55,
  digit8: 56,
  digit9: 57,
  uppercaseA: 65,
  uppercaseB: 66,
  uppercaseC: 67,
  uppercaseD: 68,
  uppercaseE: 69,
  uppercaseF: 70,
  uppercaseG: 71,
  uppercaseH: 72,
  uppercaseI: 73,
  uppercaseJ: 74,
  uppercaseK: 75,
  uppercaseL: 76,
  uppercaseM: 77,
  uppercaseN: 78,
  uppercaseO: 79,
  uppercaseP: 80,
  uppercaseQ: 81,
  uppercaseR: 82,
  uppercaseS: 83,
  uppercaseT: 84,
  uppercaseU: 85,
  uppercaseV: 86,
  uppercaseW: 87,
  uppercaseX: 88,
  uppercaseY: 89,
  uppercaseZ: 90,
  lowercaseA: 97,
  lowercaseB: 98,
  lowercaseC: 99,
  lowercaseD: 100,
  lowercaseE: 101,
  lowercaseF: 102,
  lowercaseG: 103,
  lowercaseH: 104,
  lowercaseI: 105,
  lowercaseJ: 106,
  lowercaseK: 107,
  lowercaseL: 108,
  lowercaseM: 109,
  lowercaseN: 110,
  lowercaseO: 111,
  lowercaseP: 112,
  lowercaseQ: 113,
  lowercaseR: 114,
  lowercaseS: 115,
  lowercaseT: 116,
  lowercaseU: 117,
  lowercaseV: 118,
  lowercaseW: 119,
  lowercaseX: 120,
  lowercaseY: 121,
  lowercaseZ: 122,

  byteOrderMark: 0xfeff,
  replacementCharacter: 0xfffd, // �

  asciiTab: 0x09,
  asciiLineFeed: 0x0a,
  asciiCarriageReturn: 0x0d,
  asciiC0End: 0x20, // exclusive
  asciiC1Start: 0x7f, // inclusive
  asciiC1End: 0xa0, // exclusive
} as const;

export function isAlphaNum(code: Code): boolean {
  return (
    (code >= codes.digit0 && code <= codes.digit9) ||
    (code >= codes.lowercaseA && code <= codes.lowercaseZ) ||
    (code >= codes.uppercaseA && code <= codes.uppercaseZ)
  );
}

export function isAlpha(code: Code): boolean {
  return (
    (code >= codes.lowercaseA && code <= codes.lowercaseZ) ||
    (code >= codes.uppercaseA && code <= codes.uppercaseZ)
  );
}

export function isDigit(code: Code): boolean {
  return code >= codes.digit0 && code <= codes.digit9;
}

export function isHexDigit(code: Code): boolean {
  return (
    (code >= codes.digit0 && code <= codes.digit9) ||
    (code >= codes.lowercaseA && code <= codes.lowercaseF) ||
    (code >= codes.uppercaseA && code <= codes.uppercaseF)
  );
}
