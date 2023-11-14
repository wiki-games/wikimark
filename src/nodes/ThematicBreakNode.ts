import { nodeTypes } from "../nodes.js";
import { AstNode } from "./AstNode.js";

export class ThematicBreakNode extends AstNode {
  constructor() {
    super(nodeTypes.thematicBreak);
    this.isInline = false;
  }
}
