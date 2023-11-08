import { CommentNode, TextNode, nodeTypes } from "../nodes.js";
import { codes } from "../utils/codes.js";
import { WikimarkWriter } from "../wikimark/WikimarkWriter.js";
import { AstNode } from "./AstNode.js";

/**
 * The [LinkNode] class represents a hyperlink, an equivalent of HTML `<a href=.../>`.
 * The primary property of a link is its [target] -- where should the user go when
 * clicking on the link. The children of a LinkNode are inline elements that comprise
 * the visible portion of the link, i.e. the "text" of the link, even though it may have
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
 * This text fragment should be added via [addBleedingEnd()].
 */
export class LinkNode extends AstNode {
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

  // When this is true, the last child represents the "bleeding end" of a node, and
  // should be rendered outside of the link's square brackets.
  private _hasBleedingEnd: boolean;

  get target(): string {
    if (this._target === null) {
      const targetText = this.getImpliedTarget();
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

  addBleedingEnd(text: string): this {
    if (this.children.length === 0 && this._target !== null) {
      this.addChild(new TextNode(this._target));
    }
    // Normally, when adding a text node it will merge with any existing text node.
    // In order to artificially keep them separate, we temporary create a "barrier"
    // between them using a comment node.
    const comment = new CommentNode("");
    const tail = new TextNode(text);
    this.addChild(comment);
    this.addChild(tail);
    this.removeChild(comment);
    this._hasBleedingEnd = true;
    return this;
  }

  override _writeWikimark(out: WikimarkWriter): void {
    // Note: the Wikimark representation of a Link doesn't include the `target`. It is
    // the job of a linter to verify that either the target is the same as the display
    // text of the link, or that there is a LinkDefinition node somewhere in the
    // document.
    out.writeChar(codes.bracketLeft);
    let n = this.children.length - (this._hasBleedingEnd ? 1 : 0);
    for (let i = 0; i < n; i++) {
      this.children[i]._writeWikimark(out);
    }
    out.writeChar(codes.bracketRight);
    if (this._hasBleedingEnd) {
      this.lastChild!._writeWikimark(out);
    }
  }

  override toString(): string {
    return `Link: ${this.target}`;
  }

  getImpliedTarget(): string {
    let text = "";
    let n = this.children.length - (this._hasBleedingEnd ? 1 : 0);
    for (let i = 0; i < n; i++) {
      text += this.children[i].toPlainText();
    }
    return text;
  }
}
