import {
  codes,
  isAlpha,
  isAlphaNum,
  isDigit,
  isHexDigit,
} from "../utils/codes.js";
import { tokens, Token } from "./tokens.js";
import { ok as assert } from "devlop";

export function tokenize(input: string): Array<Token> {
  const lexer = new Lexer(input);
  return lexer.parse();
}

class Lexer {
  constructor(text: string) {
    this.text = text;
    this.tokens = [];
    this.modes = [];
    this.position = 0;
    this.lineNumber = 1;
    this.lineStart = 0;
    this.expectClosingTag = null;
    this.mode_main = () => this.mainMode();
    this.mode_html = () => this.htmlTagMode();
    this.mode_raw = () => this.rawMode();
  }

  private readonly text: string;
  private readonly tokens: Array<Token>;
  private readonly modes: Array<() => boolean>;
  private readonly mode_main: () => boolean;
  private readonly mode_html: () => boolean;
  private readonly mode_raw: () => boolean;
  private expectClosingTag: string | null;

  /** Current parsing position, an offset within [text]. */
  private position: number;

  /** Current line number, 1-based. */
  private lineNumber: number;

  /** The parsing position of the start of the current line */
  private lineStart: number;

  /**
   * Main public function to break the input [text] into tokens. This function
   * should only be called once.
   */
  parse(): Array<Token> {
    assert(this.position === 0);
    assert(this.lineNumber === 1 && this.lineStart === 0);
    this.pushMode(this.mode_main);
    while (!this.atEof) {
      const mode = this.modes[this.modes.length - 1];
      const ok = mode();
      assert(ok);
    }
    return this.tokens;
  }

  private get location(): [number, number] {
    return [this.lineNumber, this.position - this.lineStart + 1];
  }

  private get atEof(): boolean {
    return this.position >= this.text.length;
  }

  private get code(): number {
    return this.text.charCodeAt(this.position);
  }

  private codeAt(delta: number): number {
    assert(delta >= 0);
    const i = this.position + delta;
    return i < this.text.length ? this.text.charCodeAt(i) : codes.eof;
  }

  private pushMode(mode: () => boolean): boolean {
    this.modes.push(mode);
    return true;
  }

  private popMode(mode: () => boolean): boolean {
    const removed = this.modes.pop();
    assert(removed === mode, `Expected ${mode} but found ${removed}`);
    return true;
  }

  //------------------------------------------------------------------------------------
  // Modes
  //------------------------------------------------------------------------------------

  private mainMode(): boolean {
    return (
      this.matchWhitespace() ||
      this.matchNewline() ||
      this.matchPlainText() ||
      this.matchHtmlComment() ||
      this.matchHtmlEntity() ||
      (this.matchHtmlTagStart() && this.pushMode(this.mode_html)) ||
      this.matchSpecialCharacterRun() ||
      this.matchSpecialCharacterSingle() ||
      this.matchInvalid()
    );
  }

  private htmlTagMode(): boolean {
    return (
      this.matchWhitespace() ||
      this.matchNewline() ||
      this.matchBareWord() ||
      this.matchEqualSign() ||
      this.matchQuotedString() ||
      (this.matchHtmlTagEnd() &&
        this.popMode(this.mode_html) &&
        this.maybeEnterSpecialHtmlMode()) ||
      this.matchHtmlInvalidText()
    );
  }

  private rawMode(): boolean {
    return (
      (this.matchClosingHtmlTag() && this.popMode(this.mode_raw)) ||
      this.matchRawText() ||
      this.matchSpecialCharacterSingle()
    );
  }

  //------------------------------------------------------------------------------------
  // Matchers
  //------------------------------------------------------------------------------------

  private matchWhitespace(): boolean {
    const loc0 = this.location;
    let text = "";
    while (true) {
      const code = this.code;
      if (code === codes.space || code === codes.asciiTab) {
        text += " ";
        this.position++;
        if (code === codes.asciiTab) {
          while ((this.position - this.lineStart) % 4 != 0) {
            text += " ";
            this.lineStart--;
          }
        }
      } else {
        break;
      }
    }
    if (text) {
      this.tokens.push({
        type: tokens.whitespace,
        text: text,
        start: loc0,
        end: this.location,
      });
      return true;
    }
    return false;
  }

  private matchNewline(): boolean {
    const code0 = this.code;
    if (code0 === codes.lineFeed || code0 === codes.carriageReturn) {
      const loc0 = this.location;
      this.position++;
      if (code0 === codes.carriageReturn && this.code === codes.lineFeed) {
        this.position++;
      }
      this.tokens.push({
        type: tokens.newline,
        text: "\n",
        start: loc0,
        end: this.location,
      });
      this.lineNumber++;
      this.lineStart = this.position;
      return true;
    }
    return false;
  }

  private matchHtmlComment(): boolean {
    if (
      this.code === codes.lessThanSign &&
      this.text.substring(this.position, this.position + 4) === "<!--"
    ) {
      const loc0 = this.location;
      this.position += 4;
      const loc1 = this.location;
      const pos1 = this.position;
      this.tokens.push({
        type: tokens.commentStart,
        text: "<!--",
        start: loc0,
        end: loc1,
      });
      let text = "";
      while (!this.atEof) {
        const code0 = this.codeAt(0);
        if (
          code0 === codes.hyphen &&
          this.text.substring(this.position, this.position + 3) === "-->"
        ) {
          break;
        }
        if (code0 === codes.carriageReturn || code0 === codes.lineFeed) {
          const code1 = this.codeAt(1);
          this.position +=
            code0 === codes.carriageReturn && code1 === codes.lineFeed ? 2 : 1;
          this.lineNumber++;
          this.lineStart = this.position;
          text += "\n";
        } else {
          text += String.fromCharCode(code0);
          this.position++;
        }
      }
      const loc2 = this.location;
      if (text) {
        this.tokens.push({
          type: tokens.commentBody,
          text: text,
          start: loc1,
          end: loc2,
        });
      }
      if (!this.atEof) {
        this.position += 3;
        this.tokens.push({
          type: tokens.commentEnd,
          text: "-->",
          start: loc2,
          end: this.location,
        });
      }
      return true;
    }
    return false;
  }

  private matchHtmlTagStart(): boolean {
    if (this.code === codes.lessThanSign) {
      const loc0 = this.location;
      const pos0 = this.position;
      this.position += this.codeAt(1) === codes.slash ? 2 : 1;
      const loc1 = this.location;
      const pos1 = this.position;
      if (isAlpha(this.code)) {
        while (isAlphaNum(this.code)) {
          this.position++;
        }
      }
      if (this.position > pos1) {
        const isClosing = pos1 - pos0 === 2;
        const tag = this.text.substring(pos1, this.position);
        this.tokens.push({
          type: tokens.htmlTagStart,
          text: isClosing ? "</" : "<",
          start: loc0,
          end: loc1,
        });
        this.tokens.push({
          type: tokens.htmlTagName,
          text: tag,
          start: loc1,
          end: this.location,
        });
        return true;
      } else {
        this.position = pos0;
      }
    }
    return false;
  }

  private matchHtmlTagEnd(): boolean {
    if (this.code === codes.greaterThanSign) {
      const loc0 = this.location;
      this.position++;
      this.tokens.push({
        type: tokens.htmlTagEnd,
        text: ">",
        start: loc0,
        end: this.location,
      });
      return true;
    }
    if (this.code === codes.slash && this.codeAt(1) === codes.greaterThanSign) {
      const loc0 = this.location;
      this.position += 2;
      this.tokens.push({
        type: tokens.htmlTagEnd,
        text: "/>",
        start: loc0,
        end: this.location,
      });
      return true;
    }
    return false;
  }

  private matchPlainText(): boolean {
    const loc0 = this.location;
    let text = "";
    while (!this.atEof) {
      const code0 = this.code;
      if (code0 <= codes.space) break;
      else if (code0 < codes.asciiC1Start) {
        if (SPECIAL_CHARACTER_RUNS.has(code0)) break;
        if (SPECIAL_CHARACTERS_SINGLE.has(code0)) break;
        text += String.fromCharCode(code0);
      } else if (code0 < codes.asciiC1End) break;
      else {
        text += String.fromCharCode(code0);
      }
      this.position++;
    }
    if (text) {
      this.tokens.push({
        type: tokens.text,
        text: text,
        start: loc0,
        end: this.location,
      });
      return true;
    }
    return false;
  }

  private matchInvalid(): boolean {
    const loc0 = this.location;
    this.position++;
    this.tokens.push({
      type: tokens.text,
      text: "\ufffd",
      start: loc0,
      end: this.location,
    });
    return true;
  }

  private matchSpecialCharacterRun(): boolean {
    const code0 = this.code;
    if (SPECIAL_CHARACTER_RUNS.has(code0)) {
      const loc0 = this.location;
      let text = "";
      while (this.code === code0) {
        this.position++;
        text += String.fromCharCode(code0);
      }
      this.tokens.push({
        type: SPECIAL_CHARACTER_RUNS.get(code0)!,
        text: text,
        start: loc0,
        end: this.location,
      });
      return true;
    }
    return false;
  }

  private matchSpecialCharacterSingle(): boolean {
    const code0 = this.code;
    if (SPECIAL_CHARACTERS_SINGLE.has(code0)) {
      const loc0 = this.location;
      this.position++;
      this.tokens.push({
        type: SPECIAL_CHARACTERS_SINGLE.get(code0)!,
        text: String.fromCharCode(code0),
        start: loc0,
        end: this.location,
      });
      return true;
    }
    return false;
  }

  private matchBareWord(): boolean {
    const loc0 = this.location;
    let text = "";
    while (!this.atEof) {
      const code = this.code;
      if (
        isAlphaNum(code) ||
        code === codes.hyphen ||
        code === codes.underscore
      ) {
        text += String.fromCharCode(code);
        this.position++;
      } else {
        break;
      }
    }
    if (text) {
      this.tokens.push({
        type: tokens.htmlBareWord,
        text: text,
        start: loc0,
        end: this.location,
      });
      return true;
    }
    return false;
  }

  private matchEqualSign(): boolean {
    if (this.code === codes.equalSign) {
      const loc0 = this.location;
      this.position++;
      this.tokens.push({
        type: tokens.equal,
        text: "=",
        start: loc0,
        end: this.location,
      });
      return true;
    }
    return false;
  }

  private matchQuotedString(): boolean {
    const code0 = this.code;
    if (code0 === codes.quoteSingle || code0 === codes.quoteDouble) {
      const loc0 = this.location;
      const pos0 = this.position;
      this.position++;
      while (!this.atEof) {
        if (this.code === code0) {
          this.position++;
          break;
        }
        this.position++;
      }
      this.tokens.push({
        type: tokens.htmlQuotedString,
        text: this.text.substring(pos0, this.position),
        start: loc0,
        end: this.location,
      });
      return true;
    }
    return false;
  }

  private matchHtmlInvalidText(): boolean {
    const loc0 = this.location;
    const text = this.text[this.position];
    this.position++;
    this.tokens.push({
      type: tokens.htmlUnknown,
      text: text,
      start: loc0,
      end: this.location,
    });
    return true;
  }

  private matchHtmlEntity(): boolean {
    return (
      this.code === codes.ampersand &&
      (this.matchHtmlNamedEntity() ||
        this.matchHtmlHexEntity() ||
        this.matchHtmlDecimalEntity())
    );
  }

  private matchHtmlNamedEntity(): boolean {
    if (this.code === codes.ampersand) {
      const loc0 = this.location;
      const pos0 = this.position;
      this.position++;
      while (isAlpha(this.code)) {
        this.position++;
      }
      if (this.codeAt(0) === codes.semicolon && this.position > pos0 + 1) {
        this.position++;
        this.tokens.push({
          type: tokens.htmlEntity,
          text: this.text.substring(pos0, this.position),
          start: loc0,
          end: this.location,
        });
        return true;
      }
      this.position = pos0;
    }
    return false;
  }

  private matchHtmlDecimalEntity(): boolean {
    if (this.code === codes.ampersand && this.codeAt(1) === codes.numberSign) {
      const loc0 = this.location;
      const pos0 = this.position;
      this.position += 2;
      while (isDigit(this.code)) {
        this.position++;
      }
      if (this.codeAt(0) === codes.semicolon && this.position > pos0 + 2) {
        this.position++;
        this.tokens.push({
          type: tokens.htmlEntity,
          text: this.text.substring(pos0, this.position),
          start: loc0,
          end: this.location,
        });
        return true;
      }
      this.position = pos0;
    }
    return false;
  }

  private matchHtmlHexEntity(): boolean {
    if (
      this.code === codes.ampersand &&
      this.codeAt(1) === codes.numberSign &&
      this.codeAt(2) === codes.lowercaseX
    ) {
      const loc0 = this.location;
      const pos0 = this.position;
      this.position += 3;
      while (isHexDigit(this.code)) {
        this.position++;
      }
      if (this.codeAt(0) === codes.semicolon && this.position > pos0 + 3) {
        this.position++;
        this.tokens.push({
          type: tokens.htmlEntity,
          text: this.text.substring(pos0, this.position),
          start: loc0,
          end: this.location,
        });
        return true;
      }
      this.position = pos0;
    }
    return false;
  }

  /**
   * This method is called immediately after exiting an HtmlTag mode, and it checks
   * whether, based on the name of the html tag, we need to enter a special parsing
   * mode. Always returns true.
   */
  private maybeEnterSpecialHtmlMode(): boolean {
    let i = this.tokens.length - 1;
    while (this.tokens[i].type !== tokens.htmlTagName) {
      i--;
    }
    const tag = this.tokens[i].text.toLowerCase();
    if (tag === "pre" || tag === "syntaxhighlight") {
      this.pushMode(this.mode_raw);
      this.expectClosingTag = tag;
    }
    return true;
  }

  private matchClosingHtmlTag(): boolean {
    assert(this.expectClosingTag !== null);
    if (
      this.codeAt(0) === codes.lessThanSign &&
      this.codeAt(1) === codes.slash
    ) {
      const loc0 = this.location;
      this.position += 2;
      const pos1 = this.position;
      const loc1 = this.location;
      while (isAlphaNum(this.code)) {
        this.position++;
      }
      const closingTag = this.text.substring(pos1, this.position).toLowerCase();
      if (closingTag === this.expectClosingTag) {
        const loc2 = this.location;
        const hasWhitespace = this.matchWhitespace();
        const whitespaceToken = hasWhitespace ? this.tokens.pop() : null;
        const loc3 = this.location;
        if (this.codeAt(0) === codes.greaterThanSign) {
          this.tokens.push({
            type: tokens.htmlTagStart,
            text: "</",
            start: loc0,
            end: loc1,
          });
          this.tokens.push({
            type: tokens.htmlTagName,
            text: closingTag,
            start: loc1,
            end: loc2,
          });
          if (hasWhitespace) {
            this.tokens.push(whitespaceToken!);
          }
          this.position++;
          this.tokens.push({
            type: tokens.htmlTagEnd,
            text: ">",
            start: loc3,
            end: this.location,
          });
          this.expectClosingTag = null;
          return true;
        }
      }
      this.position = pos1 - 2;
    }
    return false;
  }

  private matchRawText(): boolean {
    const loc0 = this.location;
    let text = "";
    while (!this.atEof) {
      const code0 = this.codeAt(0);
      if (code0 === codes.lessThanSign && this.codeAt(1) === codes.slash) {
        break;
      }
      if (code0 === codes.carriageReturn || code0 === codes.lineFeed) {
        const code1 = this.codeAt(1);
        this.position +=
          code0 === codes.carriageReturn && code1 === codes.lineFeed ? 2 : 1;
        this.lineNumber++;
        this.lineStart = this.position;
        text += "\n";
      } else {
        text += String.fromCharCode(code0);
        this.position++;
      }
    }
    if (text) {
      this.tokens.push({
        type: tokens.text,
        text: text,
        start: loc0,
        end: this.location,
      });
      return true;
    }
    return false;
  }
}

const SPECIAL_CHARACTERS_SINGLE = new Map<number, string>([
  [codes.verticalBar, tokens.pipe],
  [codes.lessThanSign, tokens.leftAngleBracket],
  [codes.greaterThanSign, tokens.rightAngleBracket],
  [codes.semicolon, tokens.semicolon],
  [codes.ampersand, tokens.ampersand],
  [codes.exclamationMark, tokens.exclamation],
]);

const SPECIAL_CHARACTER_RUNS = new Map<number, string>([
  [codes.equalSign, tokens.equalSignsRun],
  [codes.quoteSingle, tokens.singleQuotesRun],
  [codes.braceLeft, tokens.leftBraceRun],
  [codes.braceRight, tokens.rightBraceRun],
  [codes.bracketLeft, tokens.leftBracketRun],
  [codes.bracketRight, tokens.rightBracketRun],
  [codes.colon, tokens.colon],
  [codes.hyphen, tokens.dash],
  [codes.asterisk, tokens.asterisk],
  [codes.numberSign, tokens.hashSign],
]);
