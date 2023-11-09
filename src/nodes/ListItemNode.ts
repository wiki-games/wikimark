import { nodeTypes } from "../nodes.js";
import { AstNode } from "./AstNode.js";

export class ListItemNode extends AstNode {
  constructor(children?: Array<AstNode>) {
    super(nodeTypes.listItem, children);
    this.isInline = true;
  }
}
