import { Code, codes } from "../utils/codes.js";
import { nodeTypes } from "../nodes.js";
import { WikimarkWriter } from "../wikimark/WikimarkWriter.js";
import { AstNode } from "./AstNode.js";

export class TextNode extends AstNode {
  constructor(text: string) {
    super(nodeTypes.text);
    this.text = text;
    this.isInline = true;
  }

  public text: string;

  override toPlainText(): string {
    return this.text;
  }

  override _writeWikimark(out: WikimarkWriter): void {
    if (!this.text) return;
    if (out.atStartOfLine) {
      const code0 = this.text.charCodeAt(0);
      if (CODES_TO_ESCAPE_AT_START_OF_LINE.has(code0)) {
        out.write(codes.backslash);
      }
    }
    const n = this.text.length;
    for (let i = 0; i < n; i++) {
      const code = this.text.charCodeAt(i);
      if (CODES_TO_ESCAPE.has(code)) {
        out.write(codes.backslash);
      }
      out.write(code);
    }
  }

  override toString(): string {
    return "Text: " + this.text;
  }
}

const CODES_TO_ESCAPE = new Set<Code>([
  codes.asterisk,
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
