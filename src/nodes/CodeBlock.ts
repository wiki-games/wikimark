import { nodeTypes } from "../nodes.js";
import { WikimarkWriter } from "../wikimark/WikimarkWriter.js";
import { AstNode } from "./AstNode.js";

export class CodeBlock extends AstNode {
  constructor(text: string) {
    super(nodeTypes.codeBlock);
    this.isInline = false;
    this.text = text;
  }

  public text: string;

  override allowsChild(node: AstNode): boolean {
    return false;
  }

  override _writeWikimark(out: WikimarkWriter): void {
    throw Error("Not implemented");
  }
}
