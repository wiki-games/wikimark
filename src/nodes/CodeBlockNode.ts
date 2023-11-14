import { nodeTypes } from "../nodes.js";
import { codes } from "../utils/codes.js";
import { WikimarkWriter } from "../wikimark/WikimarkWriter.js";
import { AstNode } from "./AstNode.js";

export class CodeBlockNode extends AstNode {
  constructor(text: string, language: string | null = null) {
    super(nodeTypes.codeBlock);
    this.isInline = false;
    this.text = text;
    this.language = language;
  }

  public text: string;
  public language: string | null;

  override _writeWikimark(out: WikimarkWriter): void {
    out.writeAll([codes.backtick, codes.backtick, codes.backtick]);
    out.writeText(this.text);
    out.writeAll([codes.backtick, codes.backtick, codes.backtick]);
  }
}
