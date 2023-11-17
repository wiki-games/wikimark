import { ok as assert } from "devlop";
import { Code, codes } from "../utils/codes.js";

/**
 * Helper class to serialize an AST node tree into a Wikimark text.
 */
export class WikimarkWriter {
  constructor() {
    this._codes = [];
    this._linePrefix = [];
    this._startOfLineIndex = 0;
  }

  private readonly _codes: Array<Code>;
  private readonly _linePrefix: Array<Code>;
  private _startOfLineIndex: number;

  toText(): string {
    let out = "";
    for (const code of this._codes) {
      out += String.fromCharCode(code);
    }
    return out;
  }

  get column(): number {
    return this._codes.length - this._startOfLineIndex;
  }

  get atStartOfLine(): boolean {
    return this.column === 0;
  }

  writeChar(code: Code): void {
    assert(code >= 0x20);
    this._handleStartOfLine();
    this._codes.push(code);
  }

  writeChars(codes: Array<Code>): void {
    assert(codes.every((code) => code >= 0x20));
    this._handleStartOfLine();
    this._codes.push(...codes);
  }

  writeNewline(): void {
    this._squashWhitespace();
    this._codes.push(10); // LF char
    this._startOfLineIndex = this._codes.length;
  }

  writeText(text: string): void {
    if (!text) return;
    if (this.atStartOfLine) {
      const code0 = text.charCodeAt(0);
      if (CODES_TO_ESCAPE_AT_START_OF_LINE.has(code0)) {
        this.writeChar(codes.backslash);
      }
    }
    const n = text.length;
    for (let i = 0; i < n; i++) {
      const code = text.charCodeAt(i);
      if (CODES_TO_ESCAPE.has(code)) {
        this.writeChar(codes.backslash);
      }
      this.writeChar(code);
    }
  }

  addLinePrefix(prefix: Array<Code>): void {
    this._linePrefix.push(...prefix);
  }

  removeLinePrefix(prefix: Array<Code>): void {
    const n = prefix.length;
    assert(this._linePrefix.slice(-n).every((e, i) => e === prefix[i]));
    this._linePrefix.splice(this._linePrefix.length - n, n);
  }

  private _handleStartOfLine(): void {
    if (this.atStartOfLine) {
      this._codes.push(...this._linePrefix);
      this._startOfLineIndex = this._codes.length;
    }
  }

  private _squashWhitespace(): void {
    while (
      this._codes.length > 0 &&
      this._codes[this._codes.length - 1] === codes.space
    ) {
      this._codes.pop();
    }
  }
}

const CODES_TO_ESCAPE = new Set<Code>([
  codes.backslash,
  codes.backtick,
  codes.braceLeft,
  codes.bracketLeft,
  codes.underscore,
]);

const CODES_TO_ESCAPE_AT_START_OF_LINE = new Set<Code>([
  codes.hyphen,
  codes.numberSign,
  codes.space,
]);
