import { LinkDefinitionNode, nodeTypes } from "../nodes.js";
import { WikimarkWriter } from "../wikimark/WikimarkWriter.js";
import { AstNode } from "./AstNode.js";

/**
 * [Document] is a root class in an AST tree.
 * 
 * A Document typically consists of a series of block nodes, such as
 * 
 *     Document:
 *       Header[1]
 *       Paragraph
 *       Paragraph
 *       Header[2]
 *       ...
 */
export class DocumentNode extends AstNode {
  constructor(children?: Array<AstNode>) {
    super(nodeTypes.document, children);
    this._linkDefs = new Map();
    this.isInline = false;
  }

  private _linkDefs: Map<string, LinkDefinitionNode>;

  override _writeWikimark(out: WikimarkWriter): void {
    if (this.children.length === 0) return;
    out.writeNewline();
    super._writeWikimark(out);
  }

  resolveLinkTarget(name: string): LinkDefinitionNode | null {
    const node = this._linkDefs.get(name);
    if (node === undefined) return null;
    return node;
  }
}
