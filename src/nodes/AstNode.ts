import { Text, nodeTypes } from "../nodes.js";
import { WikimarkWriter } from "../wikimark/WikimarkWriter.js";
import { ok as assert } from "devlop";

/**
 * [AstNode] is a base class for all structural elements that comprise a
 * document.
 */
export abstract class AstNode {
  constructor(type: string, children?: Array<AstNode>) {
    this.type = type;
    this.children = [];
    this.parent = null;
    this.isInline = false;
    children?.forEach((node) => this.addChild(node));
  }

  /**
   * The nodes's [type], one of the constants in `nodes` enum. This type is
   * in one-to-one correspondence with the node's class name.
   */
  public type: string;

  /**
   * The nodes that are contained directly inside this node. The derived
   * [AstNode]s must only use this [children] array to store all owned
   * nodes. If an [AstNode] cannot have any children, this array should
   * be empty.
   */
  public children: Array<AstNode>;

  /**
   * Direct [parent] of the current [AstNode]. This can be `null` if the
   * node is at the root of a node tree.
   */
  public parent: AstNode | null;

  /**
   * Whether the node is inline or block.
   */
  public isInline: boolean;

  //------------------------------------------------------------------------------------
  // Serialization
  //------------------------------------------------------------------------------------

  toPlainText(): string {
    let out = "";
    for (const child of this.children) {
      out += child.toPlainText();
    }
    return out;
  }

  toWikimark(): string {
    const writer = new WikimarkWriter();
    this._writeWikimark(writer);
    return writer.toText();
  }

  toDebugTree(indent: string = ""): string {
    let out = indent + this.toString();
    if (this.children.length > 0) {
      out += ":\n";
      const child_indent = indent + "  ";
      for (const child of this.children) {
        out += child.toDebugTree(child_indent);
      }
    } else {
      out += "\n";
    }
    return out;
  }

  toString(): string {
    return this.type;
  }

  _writeWikimark(out: WikimarkWriter): void {
    for (const child of this.children) {
      child._writeWikimark(out);
    }
  }

  //------------------------------------------------------------------------------------
  // Node tree construction
  //------------------------------------------------------------------------------------

  private _isOpen?: boolean;

  allowsChild(node: AstNode): boolean {
    return true;
  }

  addChild(node: AstNode): void {
    if (node.type === nodeTypes.text) {
      const lastChild = this.lastChild;
      if (lastChild?.type === nodeTypes.text) {
        (lastChild! as Text).text += (node as Text).text;
        return;
      }
    }
    this.children.push(node);
    node.parent = this;
  }

  addChildren(nodes: Array<AstNode>): void {
    for (const node of nodes) {
      this.addChild(node);
    }
  }

  removeChild(node: AstNode): void {
    assert(
      node.parent === this,
      `Cannot remove ${node}, it does not belong to ${this}`
    );
    const i = this.children.findIndex((n) => n === node);
    this.children.splice(i, 1);
    node.parent = null;
  }

  removeAllChildren(): Array<AstNode> {
    const out = this.children;
    this.children = [];
    for (const child of out) {
      child.parent = null;
    }
    return out;
  }

  replaceChild(nodeOld: AstNode, nodeNew: AstNode): void {
    const i = this.children.findIndex((p) => p === nodeOld);
    if (i !== -1) {
      this.children[i] = nodeNew;
    }
  }

  addSiblingBefore(node: AstNode): void {
    const i = this.parent!.children.findIndex((p) => p === this);
    this.parent!.children.splice(i, 0, node);
  }

  addSiblingAfter(node: AstNode): void {
    const i = this.parent!.children.findIndex((p) => p === this);
    this.parent!.children.splice(i + 1, 0, node);
  }

  get isFirstChild(): boolean {
    return this.parent === null || this.parent.children[0] === this;
  }

  get lastChild(): AstNode | null {
    if (this.children.length > 0) {
      return this.children[this.children.length - 1];
    }
    return null;
  }

  get previousSibling(): AstNode | null {
    if (this.parent === null) return null;
    const i = this.parent.children.findIndex((v) => v === this);
    return i > 0 ? this.parent.children[i - 1] : null;
  }

  findChildOfType(type: string): AstNode | null {
    if (this.children) {
      for (const child of this.children) {
        if (child.type === type) return child;
        const foundInside = child.findChildOfType(type);
        if (foundInside) return foundInside;
      }
    }
    return null;
  }

  get isOpen(): boolean {
    return this._isOpen === true;
  }

  setOpen(v: boolean) {
    if (v) {
      this._isOpen = true;
    } else {
      delete this._isOpen;
    }
  }
}
