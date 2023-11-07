import { nodeTypes } from "../nodes.js";
import { codes } from "../utils/codes.js";
import { WikimarkWriter } from "../wikimark/WikimarkWriter.js";
import { AstNode } from "./AstNode.js";

export class HeaderNode extends AstNode {
  constructor(level: number, children?: Array<AstNode>) {
    super(nodeTypes.header, children);
    this.level = level;
    this.isInline = false;
  }

  /**
   * Header level, an integer from 1 to 6.
   */
  public level: number;

  override toString(): string {
    return `${this.type}[${this.level}]`;
  }

  override _writeWikimark(out: WikimarkWriter): void {
    const prev = this.previousSibling;
    if (prev === null) {
    } else if (prev instanceof HeaderNode) {
      out.writeNewline();
    } else {
      out.writeNewline();
      out.writeNewline();
    }
    for (let i = 0; i < this.level; i++) {
      out.write(codes.numberSign);
    }
    out.write(codes.space);
    super._writeWikimark(out);
    out.writeNewline();
  }
}
