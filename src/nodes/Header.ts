import { nodeTypes } from "../nodes.js";
import { Code, codes } from "../utils/codes.js";
import { WikimarkWriter } from "../wikimark/WikimarkWriter.js";
import { AstNode } from "./AstNode.js";

export class Header extends AstNode {
  constructor(level: number, children?: Array<AstNode>) {
    super(nodeTypes.header, children);
    this.level = level;
    this.isInline = false;
  }

  /**
   * Header level, an integer from 1 to 6.
   */
  public level: number;

  override allowsChild(node: AstNode): boolean {
    return node.isInline;
  }

  override _debugTitle(): string {
    return this.type + "." + this.level.toString();
  }

  override _writeWikimark(out: WikimarkWriter): void {
    const prev = this.previousSibling;
    if (prev === null) {
    } else if (prev instanceof Header) {
      out.writeNewline();
    } else {
      out.writeNewline();
      out.writeNewline();
    }
    const prefix: Array<Code> = [];
    for (let i = 0; i < this.level; i++) {
      prefix.push(codes.numberSign);
    }
    prefix.push(codes.space);
    out.addLinePrefix(prefix);
    for (const child of this.children) {
      child._writeWikimark(out);
    }
    out.removeLinePrefix(prefix);
    out.writeNewline();
  }
}
