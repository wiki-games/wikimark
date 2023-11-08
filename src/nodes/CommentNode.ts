import { nodeTypes } from "../nodes.js";
import { AstNode } from "./AstNode.js";

export class CommentNode extends AstNode {
  constructor(text: string) {
    super(nodeTypes.comment);
    this.text = text;
  }

  public text: string;

  override toPlainText(): string {
    return "";
  }

  override toWikimark(): string {
    return "{% " + this.text + " %}";
  }

  override toString(): string {
    return "Comment: " + this.text;
  }
}
