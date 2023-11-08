import { nodeTypes } from "../nodes.js";
import { codes } from "../utils/codes.js";
import { WikimarkWriter } from "../wikimark/WikimarkWriter.js";
import { AstNode } from "./AstNode.js";

export class LinkDefinitionNode extends AstNode {
  constructor(name: string, target: string) {
    super(nodeTypes.linkDefinition);
    this.name = name;
    this.target = target;
  }

  public name: string;
  public target: string;

  override _writeWikimark(out: WikimarkWriter): void {
    out.writeChar(codes.bracketLeft);
    out.writeText(this.name);
    out.writeChar(codes.bracketRight);
    out.writeChar(codes.colon);
    out.writeChar(codes.space);
    out.writeText(this.target);
    out.writeNewline();
  }
}
