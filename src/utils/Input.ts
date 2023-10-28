import { Code, codes } from "./codes.js";
import { ok as assert } from "devlop";

const TAB_SIZE = 4;

/**
 * [Input] class wraps a text string and allows iterating over individual
 * character codes.
 *
 * Compared to the traditional for-loop, this class provides the following
 * extra features:
 * - it keeps track of the current position within the string;
 * - it performs basic normalization of input characters, such as:
 *   - the byte-order mark is removed if present;
 *   - the tab character is replaced with special code `codes.horizontalTab`
 *     and padded `codes.virtualSpace`s as needed;
 *   - all newlines are replaced with special codes `codes.eolLF`,
 *     `codes.eolCR`, or `codes.eolCRLF`;
 *   - all invalid characters (in the C0 and C1 blocks) are replaced with
 *     U+FFFD.
 */
export class Input {
  constructor(text: string) {
    this._codes = Input._textToCodes(text);
    this._index = 0;
    assert(this._codes.length > 0);
    assert(this._codes[this._codes.length - 1] === codes.eof);
  }

  /**
   * Input text converted into a normalized sequence of character codes. This array
   * will include a sentinel `codes.eof` value at the end (which means the array is
   * always non-empty). If the input string had Unicode characters beyond the BMP, then
   * some of the codes in this array will be upper/lower surrogates for those
   * characters. This works fine, as long as those characters are not modified or
   * separated from each other.
   */
  private _codes: Array<Code>;

  /**
   * The current parsing position -- an index within the [_codes] array.
   */
  private _index: number;

  /**
   * Total number of character codes in the input.
   */
  get length(): number {
    return this._codes.length - 1;
  }

  /**
   * The current parsing position.
   */
  get pos(): number {
    return this._index;
  }

  /**
   * Returns true iff the end of the input has been reached.
   */
  get atEof(): boolean {
    return this._index >= this._codes.length - 1;
  }

  /**
   * Character code at the current parsing position.
   */
  get code(): Code {
    return this._codes[this._index];
  }

  /**
   * Character code at the current position + [delta]. The delta may be either
   * positive or negative. Requesting a code of a character outside of a string returns
   * `codes.sof` or `codes.eof` respectively.
   */
  codeAt(delta: number): Code {
    const i = this._index + delta;
    return i < 0
      ? codes.sof
      : i < this._codes.length
      ? this._codes[i]
      : codes.eof;
  }

  /**
   * Advance the current parsing position by [delta], which could be either positive
   * or negative. It is illegal to advance the parsing position outside of the bounds
   * of the input string; however you can advance the parsing position to point to the
   * end of file.
   */
  advance(delta: number): void {
    this._index += delta;
    assert(
      this._index >= 0 && this._index < this._codes.length,
      `invalid index=${this._index}, delta=${delta}, len=${this._codes.length}`
    );
  }

  private static _textToCodes(text: string): Array<Code> {
    let out: Array<Code> = [];
    let i = 0;
    let column = 0;
    if (text.charCodeAt(0) === codes.byteOrderMark) {
      i++;
    }
    while (i < text.length) {
      let code = text.charCodeAt(i);
      i++;
      column++;
      // C0 ASCII control characters
      if (code < codes.asciiC0End) {
        if (code == codes.asciiCarriageReturn) {
          if (i < text.length && text.charCodeAt(i) == codes.asciiLineFeed) {
            out.push(codes.eolCRLF);
            i++;
          } else {
            out.push(codes.eolCR);
          }
          column = 0;
        } else if (code == codes.asciiLineFeed) {
          out.push(codes.eolLF);
          column = 0;
        } else if (code == codes.asciiTab) {
          out.push(codes.horizontalTab);
          while (column % TAB_SIZE != 0) {
            out.push(codes.virtualSpace);
            column++;
          }
        } else {
          out.push(codes.replacementCharacter);
        }
      }
      // C1 control characters
      else if (code >= codes.asciiC1Start && code < codes.asciiC1End) {
        out.push(codes.replacementCharacter);
      }
      // All other unicode characters, including regular ASCII
      else {
        out.push(code);
      }
    }
    out.push(codes.eof);
    return out;
  }
}
