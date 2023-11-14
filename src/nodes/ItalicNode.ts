import { nodeTypes } from "../nodes.js";
import { codes } from "../utils/codes.js";
import { WikimarkWriter } from "../wikimark/WikimarkWriter.js";
import { AstNode } from "./AstNode.js";

export class ItalicNode extends AstNode {
  constructor(children?: Array<AstNode>) {
    super(nodeTypes.italic, children);
    this.isInline = true;
  }

  override _writeWikimark(out: WikimarkWriter): void {
    out.writeChar(codes.braceLeft);
    out.writeChar(codes.slash);
    super._writeWikimark(out);
    out.writeChar(codes.slash);
    out.writeChar(codes.braceRight);
  }
}
