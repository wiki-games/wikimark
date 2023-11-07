import { nodeTypes } from "../nodes.js";
import { AstNode } from "./AstNode.js";

export class LinkDefinitionNode extends AstNode {
  constructor(name: string, target: string) {
    super(nodeTypes.linkDefinition);
    this.name = name;
    this.target = target;
  }

  public name: string;
  public target: string;
}
