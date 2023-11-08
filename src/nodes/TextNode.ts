import { nodeTypes } from "../nodes.js";
import { WikimarkWriter } from "../wikimark/WikimarkWriter.js";
import { AstNode } from "./AstNode.js";

export class TextNode extends AstNode {
  constructor(text: string) {
    super(nodeTypes.text);
    this.text = text;
    this.isInline = true;
  }

  public text: string;

  override toPlainText(): string {
    return this.text;
  }

  override toString(): string {
    return "Text: " + this.text;
  }

  override addChild(node: AstNode): void {
    throw Error(`Cannot add ${node} as a child to a TextNode`);
  }

  override _writeWikimark(out: WikimarkWriter): void {
    out.writeText(this.text);
  }
}
