import { nodeTypes } from "../nodes.js";
import { codes } from "../utils/codes.js";
import { WikimarkWriter } from "../wikimark/WikimarkWriter.js";
import { AstNode } from "./AstNode.js";

/**
 * [BoldNode] represents a fragment rendered with a bold font (`<strong/>` in HTML).
 */
export class BoldNode extends AstNode {
  constructor(children?: Array<AstNode>) {
    super(nodeTypes.bold, children);
    this.isInline = true;
  }

  override _writeWikimark(out: WikimarkWriter): void {
    out.writeChar(codes.braceLeft);
    out.writeChar(codes.asterisk);
    super._writeWikimark(out);
    out.writeChar(codes.asterisk);
    out.writeChar(codes.braceRight);
  }
}
