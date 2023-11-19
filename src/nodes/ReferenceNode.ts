import { nodeTypes } from "../nodes.js";
import { AstNode } from "./AstNode.js";

export class ReferenceNode extends AstNode {
  constructor(children?: Array<AstNode>) {
    super(nodeTypes.reference, children);
    this.isInline = true;
  }
}
