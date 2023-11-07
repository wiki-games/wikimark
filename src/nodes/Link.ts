import { Text, nodeTypes } from "../nodes.js";
import { codes } from "../utils/codes.js";
import { WikimarkWriter } from "../wikimark/WikimarkWriter.js";
import { AstNode } from "./AstNode.js";

/**
 * The [Link] class represents a hyperlink, an equivalent of HTML `<a href=.../>`.
 * The primary property of a link is its [target] -- where should the user go when
 * clicking on the link. The children of a Link are inline elements that comprise the
 * visible portion of the link, i.e. the "text" of the link, even though it may have
 * more complicated markup than plain text.
 *
 * In Wikitext, there are 3 primary forms of a link:
 *   - plain link `[[target]]`;
 *   - renamed link `[[target|display text]]`;
 *   - external link `[URL]` or `[URL display text]`.
 *
 * In Wikimark, there is only one form:
 *   - plain link `[display text]`,
 * with an additional "link definition" construct that allows to provide a target
 * different from that which is derived from the display text:
 *   - `[display text]: target`, or
 *   - `[display text]: URL`.
 *
 * Both Wikitext and Wikimark (but not Markdown) support link "bleeding", where the
 * text immediately after the link becomes part of the link's text but not link's
 * target:
 *   - `[bleed]ing` -> `<a href="bleed">bleeding</a>`.
 *  This text fragment should be added via [addBleedingEnd()].
 */
export class Link extends AstNode {
  constructor(target: string | null, children?: Array<AstNode>) {
    super(nodeTypes.link, children);
    this._target = target;
    this._hasBleedingEnd = false;
    this.isInline = true;
  }

  // When parsing Wikitext, the [target] will always be known. If parsing Wikimark,
  // the target will not be initially known, but can be resolved later via the 
  // document root.
  private _target: string | null;

  private _hasBleedingEnd: boolean;

  override allowsChild(node: AstNode): boolean {
    return node.isInline;
  }

  get target(): string {
    if (this._target === null) {
      const targetText = this._getInnerText();
      const definitionNode = this.root.resolveLinkTarget(targetText);
      if (definitionNode === null) {
        this._target = targetText;
      } else {
        this._target = definitionNode.target;
      }
    }
    return this._target;
  }

  get isExternal(): boolean {
    return /^https?:\/\//.test(this.target);
  }

  addBleedingEnd(text: string): void {
    this.addChild(new Text(text));
    this._hasBleedingEnd = true;
  }

  override _writeWikimark(out: WikimarkWriter): void {
    out.write(codes.bracketLeft);
    super._writeWikimark(out);
    out.write(codes.bracketRight);
  }

  private _getInnerText(): string {
    let text = "";
    let n = this.children.length - (this._hasBleedingEnd? 1 : 0);
    for (let i = 0; i < n; i++) {
      text += this.children[i].toPlainText();
    }
    return text;
  }
}
