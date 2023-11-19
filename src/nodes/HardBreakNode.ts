import { AstNode, nodeTypes } from "../nodes.js";

export class HardBreakNode extends AstNode {
  constructor() {
    super(nodeTypes.hardBreak);
    this.isInline = true;
  }
}
