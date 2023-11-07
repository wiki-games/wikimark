import {
  AstNode,
  BoldNode,
  DocumentNode,
  HeaderNode,
  ItalicNode,
  ParagraphNode,
  TextNode,
  nodeTypes,
} from "../nodes.js";
import { LinkNode } from "../nodes/LinkNode.js";
import { tokenize } from "./tokenize.js";
import { Token, reprToken, tokens } from "./tokens.js";
import { ok as assert } from "devlop";

export function parse(text: string): DocumentNode {
  const tokens = tokenize(text);
  const parser = new Parser(tokens);
  return parser.parse();
}

class Parser {
  constructor(tokens: Array<Token>) {
    this.tokens = tokens;
    this.position = 0;
    this.biDelimiters = [];
  }

  protected tokens: Array<Token>;
  protected position: number;
  private biDelimiters: Array<BINode>;

  parse(): DocumentNode {
    const root = new DocumentNode();
    this.processTemplates();
    this.position = 0;
    while (this.position < this.tokens.length) {
      const ok = this.parseBlockLine(root);
      if (!ok) {
        const token = this.tokenAt(0);
        throw Error(
          `Unable to parse the document at token ${reprToken(token)}`
        );
      }
    }
    root.lastChild?.setOpen(false);
    return root;
  }

  //------------------------------------------------------------------------------------
  // Template handling
  //------------------------------------------------------------------------------------

  /**
   * Pre-processes the input array of tokens, looking for sequences that represent
   * template invocations. Each such sequence is replaced with a single `TemplateToken`,
   * updating `this.tokens` array in-place.
   *
   * For each template we parse its name and arguments, where each argument can be
   * either named or positional. The value of each argument is represented as a
   * sub-array of tokens. If a value contains another template sequence, it will be
   * processed and replaced with a `TemplateToken` recursively.
   *
   * An invalid template invocation (for example without closing braces, or where the
   * name has invalid characters) will be left as-is.
   */
  private processTemplates(): void {
    const outTokens = new Array<Token>();
    for (let i = 0; i < this.tokens.length; i++) {
      const token0 = this.tokens[i];
      if (token0.type === tokens.leftBraceRun && token0.text.length === 2) {
        this.position = i;
        const template = this.parseTemplate();
        if (template !== null) {
          outTokens.push(template);
          i = this.position;
          continue;
        }
      }
      outTokens.push(token0);
    }
    this.tokens = outTokens;
  }

  private parseTemplate(): TemplateToken | null {
    const token0 = this.tokenAt(0)!;
    assert(token0.type === tokens.leftBraceRun);
    this.position++;
    const name = this.parseTemplateName();
    if (name !== null) {
      const args: Array<[string | null, Array<Token>]> = new Array();
      while (true) {
        const token1 = this.tokenAt(0);
        if (token1 === null) return null;
        if (token1.type === tokens.pipe) {
          this.position++;
          const argName = this.parseTemplateArgName();
          const argValue = this.parseTemplateArgValue();
          args.push([argName, argValue]);
        } else if (token1.type === tokens.rightBraceRun) {
          if (token1.text.length !== 2) {
            return null;
          }
          return {
            type: tokens.templateNode,
            text: "\ufffd",
            start: token0.start,
            end: token1.end,
            name: name,
            args: args,
          };
        } else {
          throw Error(
            `Unexpected token in parseTemplate(): ${reprToken(token1)}`
          );
        }
      }
    }
    return null;
  }

  /**
   * Parses the name of a template, and returns it as a string. The parsing position
   * will advance to point to the next `|` or `}}` token.
   * If the name is invalid, returns `null`.
   */
  private parseTemplateName(): string | null {
    this.skipTemplateWhitespace();
    let text = "";
    let done = false;
    while (!done) {
      const token0 = this.tokenAt(0);
      if (token0 === null) return null;
      switch (token0.type) {
        case tokens.whitespace:
          text += " ";
          break;
        case tokens.newline:
        case tokens.rightBraceRun:
        case tokens.pipe:
          done = true;
          this.position--;
          break;
        case tokens.leftBraceRun:
        case tokens.leftBracketRun:
        case tokens.rightBracketRun:
        case tokens.leftAngleBracket:
        case tokens.rightAngleBracket:
        case tokens.htmlTagStart:
        case tokens.htmlEntity:
          return null;
        case tokens.commentStart:
        case tokens.commentBody:
        case tokens.commentEnd:
          break;
        default:
          text += token0.text;
          break;
      }
      this.position++;
    }
    this.skipTemplateWhitespace();
    const token1 = this.tokenAt(0);
    if (token1 !== null) {
      const type = token1.type;
      if (
        type === tokens.pipe ||
        (type === tokens.rightBraceRun && token1.text.length === 2)
      ) {
        text = text.replace(/\s+$/, "");
        if (text.length > 0) {
          return text;
        }
      }
    }
    return null;
  }

  /**
   * Parses the name of a template argument, in the form `name =`. The parsing position
   * is advanced after the `=` sign.
   * If the name is invalid, or if there is no "=" sign, then returns `null` without
   * advancing the parsing position.
   */
  private parseTemplateArgName(): string | null {
    const pos0 = this.position;
    this.skipTemplateWhitespace();
    let text = "";
    let done = false;
    while (!done) {
      const token0 = this.tokenAt(0);
      if (token0 === null) return null;
      const type = token0.type;
      switch (type) {
        case tokens.whitespace:
          text += " ";
          break;
        case tokens.newline:
        case tokens.rightBraceRun:
        case tokens.pipe:
        case tokens.equal:
        case tokens.equalSignsRun:
        case tokens.leftBraceRun:
        case tokens.leftBracketRun:
        case tokens.rightBracketRun:
        case tokens.leftAngleBracket:
        case tokens.rightAngleBracket:
        case tokens.htmlTagStart:
        case tokens.htmlEntity:
          done = true;
          this.position--;
          break;
        case tokens.commentStart:
        case tokens.commentBody:
        case tokens.commentEnd:
          break;
        default:
          text += token0.text;
          break;
      }
      this.position++;
    }
    this.skipTemplateWhitespace();
    const token1 = this.tokenAt(0);
    if (token1 !== null) {
      if (token1.type === tokens.equalSignsRun && token1.text.length == 1) {
        text = text.replace(/\s+$/, "");
        if (text.length > 0) {
          this.position++;
          return text;
        }
      }
    }
    this.position = pos0;
    return null;
  }

  private parseTemplateArgValue(): Array<Token> {
    const out: Array<Token> = [];
    while (true) {
      const token0 = this.tokenAt(0);
      if (token0 === null) break;
      if (token0.type === tokens.pipe) break;
      if (token0.type === tokens.rightBraceRun && token0.text.length === 2)
        break;
      if (token0.type === tokens.leftBraceRun && token0.text.length === 2) {
        const pos0 = this.position;
        const template = this.parseTemplate();
        if (template !== null) {
          out.push(template);
          continue;
        }
        this.position = pos0;
      }
      out.push(token0);
      this.position++;
    }
    return out;
  }

  private skipTemplateWhitespace(): void {
    while (true) {
      const token0 = this.tokenAt(0);
      if (token0 === null) break;
      if (token0.type !== tokens.whitespace && token0.type !== tokens.newline) {
        break;
      }
      this.position++;
    }
  }

  //------------------------------------------------------------------------------------
  // Block constructs parsing
  //
  // Most block parsers work on a line-by-line basis, where each subsequent parser,
  // when matches, decides whether to extend the previously parsed syntactic structure,
  // or start a new one.
  //
  // All parsers take a [parent] node as an argument, and if successfully match at the
  // current parsing position, then push the new node into the parent and return `true`.
  // If a parser fails to match, it returns `false` and does not modify the parsing
  // position.
  //------------------------------------------------------------------------------------

  private parseBlockLine(parent: AstNode): boolean {
    return (
      this.parseEmptyLine(parent) ||
      this.parseHeader(parent) ||
      this.parseParagraph(parent)
    );
  }

  /**
   * An empty line, if it matches, always closes any previously opened block nodes.
   */
  private parseEmptyLine(parent: AstNode): boolean {
    const pos0 = this.position;
    while (this.tokenAt(0)?.type === tokens.whitespace) {
      this.position++;
    }
    const token1 = this.tokenAt(0);
    if (token1 === null || token1.type === tokens.newline) {
      parent.lastChild?.setOpen(false);
      this.position++;
      return true;
    } else {
      this.position = pos0;
      return false;
    }
  }

  private parseParagraph(parent: AstNode): boolean {
    let node = parent.lastChild;
    if (node !== null && node.type === nodeTypes.paragraph && node.isOpen) {
      node.addChild(new TextNode(" "));
    } else {
      node?.setOpen(false);
      node = new ParagraphNode();
      node.setOpen(true);
      parent.addChild(node);
    }
    assert(node instanceof ParagraphNode);
    this.parseInline(node);
    return true;
  }

  private parseHeader(parent: AstNode): boolean {
    const pos0 = this.position;
    const token0 = this.tokenAt(0);
    if (token0?.type === tokens.equalSignsRun) {
      const posEol = this.findEndOfLine();
      if (posEol - 1 === pos0) return false;
      const token1 = this.tokens[posEol - 1];
      if (token1.type === tokens.equalSignsRun) {
        const level = Math.min(token0.text.length, token1.text.length, 6);
        // We will collect all tokens between pos0 and posEol here, and parse them
        // in a separate parser.
        const middleTokens = new Array<Token>();
        let i0: number = pos0 + 1;
        if (token0.text.length > level) {
          middleTokens.push({
            type: tokens.text,
            text: "=".repeat(token0.text.length - level),
            start: token0.start,
            end: token0.end,
          });
        } else {
          if (this.tokens[i0].type === tokens.whitespace) {
            i0++;
          }
        }
        let i1: number = posEol - 1;
        if (
          token1.text.length === level &&
          this.tokens[i1 - 1].type === tokens.whitespace
        ) {
          i1--;
        }
        for (let i = i0; i < i1; i++) {
          middleTokens.push(this.tokens[i]);
        }
        if (token1.text.length > level) {
          middleTokens.push({
            type: tokens.text,
            text: "=".repeat(token1.text.length - level),
            start: token1.start,
            end: token1.end,
          });
        }

        const node = new HeaderNode(level);
        const parser = new Parser(middleTokens);
        parser.parseInline(node);
        assert(parser.position === middleTokens.length);
        parent.lastChild?.setOpen(false);
        parent.addChild(node);
        this.position = posEol;
        const token2 = this.tokenAt(0);
        if (token2 !== null) {
          assert(token2.type === tokens.newline);
          this.position++;
        }
        return true;
      }
    }
    return false;
  }

  //------------------------------------------------------------------------------------
  // All parsers will attempt to parse a specific syntactic structure at the current
  // location, and then return `true` if successful, or `false` if not. In the latter
  // case the parser is not allowed to modify the current [position].
  //------------------------------------------------------------------------------------

  /**
   * Parses inline content starting at the current position and until the end of line,
   * and stores the produced nodes in [parent]. The parser stops when it reaches an
   * end of line, and leaves parsing position at the start of the next line.
   */
  private parseInline(parent: AstNode): boolean {
    const root = new ContainerNode();

    // Step 1: convert all tokens into nodes, though some of the nodes may be
    // temporary.
    while (true) {
      const token0 = this.tokenAt(0);
      if (token0 === null) break; // eof
      if (token0.type === tokens.newline) {
        this.position++;
        break;
      }
      const ok =
        this.parseBoldOrInlineDelimiters(root, token0) ||
        this.parseInternalLink(root, token0) ||
        this.parseExternalLink(root, token0) ||
        this.parseHtmlComment(root, token0) ||
        this.parseInlineWhitespace(root, token0) ||
        this.parseInlineText(root, token0);
      assert(ok);
    }

    // Step 2: combine/fix all temporary nodes
    this.finalizeBoldOrInlineDelimiters(root);
    let nodes = root.removeAllChildren();
    nodes = this.convertNodesToNested(nodes);
    parent.addChildren(nodes);
    return true;
  }

  private parseBoldOrInlineDelimiters(parent: AstNode, token0: Token): boolean {
    if (token0.type === tokens.singleQuoteRun) {
      const n = token0.text.length;
      if (n === 1 || n === 4 || n >= 6) {
        parent.addChild(new TextNode("'".repeat(Math.max(n - 5, 1))));
      }
      if (n === 2) this.addItalicDelimiter(parent);
      if (n === 3 || n === 4) this.addBoldDelimiter(parent);
      if (n >= 5) this.addStrongDelimiter(parent);
      this.position++;
      return true;
    }
    return false;
  }

  private addItalicDelimiter(parent: AstNode): void {
    const sig = this.biDelimiters.map((v) => v.kind).join("");
    if (sig === "" || sig === "b") {
      const node = new BINode("i");
      parent.addChild(node);
      this.biDelimiters.push(node);
    }
    if (sig === "i" || sig === "bi") {
      parent.addChild(new BINode("/i"));
      this.biDelimiters.pop();
    }
    if (sig === "s") {
      const prev = this.biDelimiters[0];
      prev.kind = "b";
      prev.addSiblingAfter(new BINode("i"));
      parent.addChild(new BINode("/i"));
    }
    if (sig === "ib") {
      this.biDelimiters.pop();
      this.biDelimiters.pop();
      parent.addChild(new BINode("/b"));
      parent.addChild(new BINode("/i"));
      const node = new BINode("b");
      parent.addChild(node);
      this.biDelimiters.push(node);
    }
  }

  private addBoldDelimiter(parent: AstNode): void {
    const sig = this.biDelimiters.map((v) => v.kind).join("");
    if (sig === "" || sig === "i") {
      const node = new BINode("b");
      parent.addChild(node);
      this.biDelimiters.push(node);
    }
    if (sig === "b" || sig === "ib") {
      parent.addChild(new BINode("/b"));
      this.biDelimiters.pop();
    }
    if (sig === "s") {
      const prev = this.biDelimiters[0];
      prev.kind = "i";
      prev.addSiblingAfter(new BINode("b"));
      parent.addChild(new BINode("/b"));
    }
    if (sig === "bi") {
      parent.addChild(new BINode("/i"));
      parent.addChild(new BINode("/b"));
      this.biDelimiters.pop();
      this.biDelimiters.pop();
      const node = new BINode("i");
      parent.addChild(node);
      this.biDelimiters.push(node);
    }
  }

  private addStrongDelimiter(parent: AstNode): void {
    const sig = this.biDelimiters.map((v) => v.kind).join("");
    if (sig === "") {
      const node = new BINode("s");
      parent.addChild(node);
      this.biDelimiters.push(node);
    }
    if (sig === "i") {
      parent.addChild(new BINode("/i"));
      this.biDelimiters.pop();
      const node = new BINode("b");
      parent.addChild(node);
      this.biDelimiters.push(node);
    }
    if (sig === "b") {
      parent.addChild(new BINode("/b"));
      this.biDelimiters.pop();
      const node = new BINode("i");
      parent.addChild(node);
      this.biDelimiters.push(node);
    }
    if (sig === "s") {
      const prev = this.biDelimiters.pop()!;
      prev.kind = "b";
      prev.addSiblingAfter(new BINode("i"));
      parent.addChild(new BINode("/i"));
      parent.addChild(new BINode("/b"));
    }
    if (sig === "bi") {
      parent.addChild(new BINode("/i"));
      parent.addChild(new BINode("/b"));
      this.biDelimiters.pop();
      this.biDelimiters.pop();
    }
    if (sig === "ib") {
      parent.addChild(new BINode("/b"));
      parent.addChild(new BINode("/i"));
      this.biDelimiters.pop();
      this.biDelimiters.pop();
    }
  }

  private finalizeBoldOrInlineDelimiters(parent: AstNode) {
    const sig = this.biDelimiters.map((v) => v.kind).join("");
    if (sig === "i") this.addItalicDelimiter(parent);
    if (sig === "b") this.addBoldDelimiter(parent);
    if (sig === "s") this.addStrongDelimiter(parent);
    if (sig === "ib") {
      const node = this.biDelimiters[1];
      node.kind = "/i";
      node.addSiblingBefore(new TextNode("'"));
    }
    if (sig === "bi") {
      const node = this.biDelimiters[0];
      node.kind = "i";
      node.addSiblingBefore(new TextNode("'"));
      this.biDelimiters[1].kind = "/i";
    }
  }

  private convertNodesToNested(nodes: Array<AstNode>): Array<AstNode> {
    const root = new ContainerNode();
    let current = root;
    for (const node of nodes) {
      if (node instanceof BINode) {
        if (node.kind === "b" || node.kind === "i") {
          const newNode = node.kind === "b" ? new BoldNode() : new ItalicNode();
          current.addChild(newNode);
          current = newNode;
        } else if (node.kind === "/b") {
          assert(current instanceof BoldNode);
          current = current.parent!;
        } else if (node.kind === "/i") {
          assert(current instanceof ItalicNode);
          current = current.parent!;
        } else {
          assert(false, `Unexpected BINode: ${node.kind}`);
        }
      } else {
        current.addChild(node);
      }
    }
    assert(current === root);
    return root.removeAllChildren();
  }

  private parseInternalLink(parent: AstNode, token0: Token): boolean {
    const pos0 = this.position;
    if (token0.type === tokens.leftBracketRun && token0.text.length % 2 === 0) {
      const target = this.parseInternalLinkTarget();
      let result: AstNode | null = null;
      if (target === null) {
      } else if (target.startsWith("File:") || target.startsWith("Image:")) {
        result = this.parseImageLink(target);
      } else {
        result = this.parsePageLink(target);
      }
      if (result !== null) {
        const token1 = this.tokenAt(0)!;
        this.position++; // skip over final `]]`
        assert(
          token1.type === tokens.rightBracketRun && token1.text.length >= 2
        );
        if (token0.text.length > 2) {
          parent.addChild(new TextNode("[".repeat(token0.text.length - 2)));
        }
        parent.addChild(result);
        if (token1.text.length > 2) {
          parent.addChild(new TextNode("]".repeat(token1.text.length - 2)));
        }
        if (token1.text.length === 2) {
          this.parseBleedingEnd(parent, result as LinkNode);
        }
        return true;
      }
    }
    this.position = pos0;
    return false;
  }

  private parseInternalLinkTarget(): string | null {
    let text = "";
    while (true) {
      const token0 = this.tokenAt(0);
      this.position++;
      if (token0 === null) return null;
      switch (token0.type) {
        case tokens.commentStart:
        case tokens.commentBody:
        case tokens.commentEnd:
          break;
        case tokens.leftBraceRun:
        case tokens.leftBracketRun:
        case tokens.rightBracketRun:
        case tokens.leftAngleBracket:
        case tokens.rightAngleBracket:
        case tokens.htmlTagStart:
        case tokens.htmlEntity:
        case tokens.newline:
          return null;
        case tokens.rightBracketRun:
          if (token0.text.length === 1) return null;
        case tokens.pipe:
          this.position--;
          return text;
        case tokens.whitespace:
          text += " ";
          break;
        default:
          text += token0.text;
          break;
      }
    }
  }

  /**
   * Starting before `|` or `]]` token, this will try to parse the text of a regular
   * page link (if present), and return the resulting [Link] node.
   */
  private parsePageLink(target: string): AstNode | null {
    return null;
  }

  private parseImageLink(target: string): AstNode | null {
    return null;
  }

  private parseBleedingEnd(parent: AstNode, linkNode: LinkNode): void {}

  private parseExternalLink(parent: AstNode, token0: Token): boolean {
    if (token0.type === tokens.leftBracketRun && token0.text.length % 2 === 1) {
    }
    return false;
  }

  private parseHtmlComment(parent: AstNode, token0: Token): boolean {
    if (token0.type === tokens.commentStart) {
      while (true) {
        const token1 = this.tokenAt(0);
        this.position++;
        if (token1 === null || token1.type === tokens.commentEnd) {
          return true;
        }
      }
    }
    return false;
  }

  private parseInlineWhitespace(parent: AstNode, token0: Token): boolean {
    if (token0.type === tokens.whitespace) {
      let last = parent.lastChild;
      if (last === null || last.type !== nodeTypes.text) {
        last = new TextNode("");
        parent.addChild(last);
      }
      (last as TextNode).text += " ";
      this.position++;
      return true;
    }
    return false;
  }

  private parseInlineText(parent: AstNode, token0: Token): boolean {
    parent.addChild(new TextNode(token0.text));
    this.position++;
    return true;
  }

  //------------------------------------------------------------------------------------
  // Helpers
  //------------------------------------------------------------------------------------

  protected tokenAt(delta: number): Token | null {
    const i = this.position + delta;
    assert(i >= 0);
    return i < this.tokens.length ? this.tokens[i] : null;
  }

  private findEndOfLine(): number {
    const n = this.tokens.length;
    for (let i = this.position; i < n; i++) {
      if (this.tokens[i].type === tokens.newline) {
        return i;
      }
    }
    return n;
  }
}

type TemplateToken = Token & {
  name: string;
  args: Array<[string | null, Array<Token>]>;
};

class ContainerNode extends AstNode {
  constructor() {
    super("div");
  }
}

class BINode extends AstNode {
  constructor(kind: "b" | "i" | "s" | "/b" | "/i" | "/s") {
    super("_BI");
    this.kind = kind;
    this.isInline = true;
  }
  public kind: string;
}
