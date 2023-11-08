import { nodeTypes } from "../nodes.js";
import { codes } from "../utils/codes.js";
import { WikimarkWriter } from "../wikimark/WikimarkWriter.js";
import { AstNode } from "./AstNode.js";
import { ok as assert } from "devlop";

export class ItalicNode extends AstNode {
  constructor(children?: Array<AstNode>) {
    super(nodeTypes.italic, children);
    this.isInline = true;
  }

  override _writeWikimark(out: WikimarkWriter): void {
    assert(
      !this.findChildOfType(nodeTypes.italic),
      "An Italic node cannot contain other italic nodes inside"
    );
    out.writeChar(codes.slash);
    super._writeWikimark(out);
    out.writeChar(codes.slash);
  }
}
