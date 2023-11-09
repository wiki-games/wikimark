import { AstNode, nodeTypes } from "../nodes.js";
import { TemplateArgNode } from "./TemplateArgNode.js";

/**
 * [TemplateNode] represents a single invocation of a template. The children of this
 * node are the template's arguments, which can be either named or unnamed.
 */
export class TemplateNode extends AstNode {
  constructor(name: string, children?: Array<TemplateArgNode>) {
    super(nodeTypes.template, children);
    this.name = name;
  }

  public name: string;
}
