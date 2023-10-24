import { nodeTypes } from "../nodes.js";
import { codes } from "../utils/codes.js";
import { WikimarkWriter } from "../wikimark/WikimarkWriter.js";
import { AstNode } from "./AstNode.js";
import { ok as assert } from "devlop";

export class Italic extends AstNode {
  constructor(children?: Array<AstNode>) {
    super(nodeTypes.italic, children);
    this.isInline = true;
  }

  override allowsChild(node: AstNode): boolean {
    return node.isInline;
  }

  override _writeWikimark(out: WikimarkWriter): void {
    assert(
      !this.findChildOfType(nodeTypes.italic),
      "An Italic node cannot contain other italic nodes inside"
    );
    out.write(codes.asterisk);
    super._writeWikimark(out);
    out.write(codes.asterisk);
  }
}
