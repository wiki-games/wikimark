import { nodeTypes } from "../nodes.js";
import { WikimarkWriter } from "../wikimark/WikimarkWriter.js";
import { AstNode } from "./AstNode.js";
import { ListItemNode } from "./ListItemNode.js";

export class UnorderedListNode extends AstNode {
  constructor(tight: boolean, children?: Array<ListItemNode>) {
    super(nodeTypes.unorderedList, children);
    this.isTight = tight;
    this.isInline = false;
  }

  public isTight: boolean;

  override toString(): string {
    return `UnorderedList[${this.isTight ? "tight" : "loose"}]`;
  }
  
  override _writeWikimark(out: WikimarkWriter): void {
    if (!this.isTight) {
      out.writeNewline();
    }
    const marker = this.isTight? "  - " : "- ";
    for (const child of this.children) {
      out.writeText(marker);
      child._writeWikimark(out);
      out.writeNewline();
    }
  }
}
