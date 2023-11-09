import { nodeTypes } from "../nodes.js";
import { AstNode } from "./AstNode.js";

export class TemplateArgNode extends AstNode {
  constructor(name: string | null, children?: Array<AstNode>) {
    super(nodeTypes.templateArg, children);
    this.name = name;
  }

  public name: string | null;
}
