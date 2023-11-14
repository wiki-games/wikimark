import { nodeTypes } from "../nodes.js";
import { AstNode } from "./AstNode.js";

export class HtmlElementNode extends AstNode {
  constructor(
    tagName: string,
    attrs?: { [key: string]: string } | Map<string, string>,
    children?: Array<AstNode>
  ) {
    super(nodeTypes.htmlElement, children);
    this.tagName = tagName;
    this.attrs =
      attrs instanceof Map
        ? attrs
        : attrs === undefined
        ? new Map()
        : new Map(Object.entries(attrs));
  }

  public tagName: string;
  public attrs: Map<string, string>;
}
