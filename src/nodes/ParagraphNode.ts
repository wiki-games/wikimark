import { nodeTypes } from "../nodes.js";
import { WikimarkWriter } from "../wikimark/WikimarkWriter.js";
import { AstNode } from "./AstNode.js";

export class ParagraphNode extends AstNode {
  constructor(children?: Array<AstNode>) {
    super(nodeTypes.paragraph, children);
    this.isInline = false;
  }

  override _writeWikimark(out: WikimarkWriter): void {
    if (!this.isFirstChild) {
      out.writeNewline();
    }
    super._writeWikimark(out);
    out.writeNewline();
  }
}
