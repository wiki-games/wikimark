import { nodeTypes } from "../nodes.js";
import { WikimarkWriter } from "../wikimark/WikimarkWriter.js";
import { AstNode } from "./AstNode.js";

export class CodeBlockNode extends AstNode {
  constructor(text: string) {
    super(nodeTypes.codeBlock);
    this.isInline = false;
    this.text = text;
  }

  public text: string;

  override _writeWikimark(out: WikimarkWriter): void {
    throw Error("Not implemented");
  }
}
