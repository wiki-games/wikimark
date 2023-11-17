import { nodeTypes } from "../nodes.js";
import { codes } from "../utils/codes.js";
import { WikimarkWriter } from "../wikimark/WikimarkWriter.js";
import { AstNode } from "./AstNode.js";

export class SuperscriptNode extends AstNode {
  constructor(children?: Array<AstNode>) {
    super(nodeTypes.superscript, children);
    this.isInline = true;
  }

  override _writeWikimark(out: WikimarkWriter): void {
    out.writeChars([codes.braceLeft, codes.caret]);
    super._writeWikimark(out);
    out.writeChars([codes.caret, codes.braceRight]);
  }
}
