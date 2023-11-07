import { nodeTypes } from "../nodes.js";
import { codes } from "../utils/codes.js";
import { WikimarkWriter } from "../wikimark/WikimarkWriter.js";
import { AstNode } from "./AstNode.js";
import { ok as assert } from "devlop";

export class BoldNode extends AstNode {
  constructor(children?: Array<AstNode>) {
    super(nodeTypes.bold, children);
    this.isInline = true;
  }

  override _writeWikimark(out: WikimarkWriter): void {
    assert(
      !this.findChildOfType(nodeTypes.bold),
      "A Bold node cannot contain other bold nodes inside"
    );
    out.write(codes.asterisk);
    super._writeWikimark(out);
    out.write(codes.asterisk);
  }
}
