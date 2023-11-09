import { nodeTypes } from "../nodes.js";
import { AstNode } from "./AstNode.js";

export class TemplateArgNode extends AstNode {
  constructor(name: string | null) {
    super(nodeTypes.templateArg);
    this.name = name;
  }

  public name: string | null;
}
