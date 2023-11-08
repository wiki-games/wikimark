import { nodeTypes } from "../nodes.js";
import { codes } from "../utils/codes.js";
import { WikimarkWriter } from "../wikimark/WikimarkWriter.js";
import { AstNode } from "./AstNode.js";

export class ItalicNode extends AstNode {
  constructor(children?: Array<AstNode>) {
    super(nodeTypes.italic, children);
    this.isInline = true;
    this.useFancyDelimiters = false;
  }

  /**
   * Whether to render the node with the plain delimiters (`/text/`), or "fancy" ones
   * (`{/text/}`).
   */
  public useFancyDelimiters: boolean;

  override _writeWikimark(out: WikimarkWriter): void {
    if (this.useFancyDelimiters) {
      out.writeChar(codes.braceLeft);
    }
    out.writeChar(codes.slash);
    super._writeWikimark(out);
    out.writeChar(codes.slash);
    if (this.useFancyDelimiters) {
      out.writeChar(codes.braceRight);
    }
  }
}
