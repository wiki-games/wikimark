import { nodeTypes } from "../nodes.js";
import { WikimarkWriter } from "../wikimark/WikimarkWriter.js";
import { AstNode } from "./AstNode.js";

export class Paragraph extends AstNode {
  constructor(children?: Array<AstNode>) {
    super(nodeTypes.paragraph, children);
    this.isInline = false;
  }

  override allowsChild(node: AstNode): boolean {
    return node.isInline;
  }

  override _writeWikimark(out: WikimarkWriter): void {
    if (!this.isFirstChild) {
      out.writeNewline();
    }
    for (const child of this.children) {
      child._writeWikimark(out);
    }
    out.writeNewline();
  }
}
