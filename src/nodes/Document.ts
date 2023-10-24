import { nodeTypes } from "../nodes.js";
import { WikimarkWriter } from "../wikimark/WikimarkWriter.js";
import { AstNode } from "./AstNode.js";

/**
 * [Document] is a root class in an AST tree.
 */
export class Document extends AstNode {
  constructor(children?: Array<AstNode>) {
    super(nodeTypes.document, children);
    this.isInline = false;
  }

  override allowsChild(node: AstNode): boolean {
    return !node.isInline;
  }

  override _writeWikimark(out: WikimarkWriter): void {
    if (this.children.length === 0) return;
    out.writeNewline();
    super._writeWikimark(out);
  }
}
