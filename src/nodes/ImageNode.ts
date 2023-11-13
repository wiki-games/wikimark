import { AstNode, nodeTypes } from "../nodes.js";

export class ImageNode extends AstNode {
  constructor(
    target: string,
    props?: { [key: string]: string },
    children?: Array<AstNode>
  ) {
    super(nodeTypes.image, children);
    this.target = target;
    this.properties = props ? new Map(Object.entries(props)) : new Map();
  }

  public target: string;
  public properties: Map<string, string>;
}
