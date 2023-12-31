import { DocumentNode, TextNode, nodeTypes } from "../nodes.js";
import { WikimarkWriter } from "../wikimark/WikimarkWriter.js";
import { ok as assert } from "devlop";

/**
 * [AstNode] is a base class for all structural elements that comprise a document.
 */
export abstract class AstNode {
  constructor(type: string, children?: Array<AstNode>) {
    this._children = [];
    this._type = type;
    this._parent = null;
    this.isInline = false;
    children?.forEach((node) => this.addChild(node));
  }

  private readonly _type: string;
  private _parent: AstNode | null;
  private _children: Array<AstNode>;
  private _isOpen?: boolean; // Temporary flag used by the parser

  //------------------------------------------------------------------------------------
  // Properties
  //------------------------------------------------------------------------------------

  /**
   * The nodes's [type], one of the constants in `nodeTypes` enum. This type is in
   * one-to-one correspondence with the node's class name. Once a node is created, its
   * type doesn't change.
   */
  get type(): string {
    return this._type;
  }

  /**
   * The nodes that are contained directly inside this node. The derived [AstNode]s
   * must only use this [children] array to store all owned nodes. If an [AstNode]
   * cannot have any children, this array should be empty.
   */
  get children(): Array<AstNode> {
    return this._children;
  }

  /**
   * Direct [parent] of the current [AstNode]. This can be `null` if the current node
   * is the root of a document tree, or if the node hasn't been attached to a document
   * tree yet.
   */
  get parent(): AstNode | null {
    return this._parent;
  }

  /**
   * Returns the root of the document tree, or throws an error if the node is not
   * currently attached to a document tree.
   */
  get root(): DocumentNode {
    if (this._parent === null) {
      if (!(this instanceof DocumentNode)) {
        throw Error(`Node ${this} is not attached to a document tree`);
      }
      return this;
    }
    return this._parent.root;
  }

  /**
   * Whether the node is inline or block.
   */
  public isInline: boolean;

  //------------------------------------------------------------------------------------
  // Serialization
  //------------------------------------------------------------------------------------

  /**
   * Plain-text representation of the node, without any markup. If the node doesn't
   * have any text content (like an image), this should return an empty string.
   */
  toPlainText(): string {
    let out = "";
    for (const child of this._children) {
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
    if (this._children.length > 0) {
      out += ":\n";
      const child_indent = indent + "  ";
      for (const child of this._children) {
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
    for (const child of this._children) {
      child._writeWikimark(out);
    }
  }

  //------------------------------------------------------------------------------------
  // Node tree construction
  //------------------------------------------------------------------------------------

  addChild(node: AstNode): void {
    if (node.type === nodeTypes.text) {
      const lastChild = this.lastChild;
      if (lastChild?.type === nodeTypes.text) {
        (lastChild! as TextNode).text += (node as TextNode).text;
        return;
      }
    }
    this._children.push(node);
    node._parent = this;
  }

  addChildren(nodes: Array<AstNode>): void {
    for (const node of nodes) {
      this.addChild(node);
    }
  }

  removeChild(node: AstNode): AstNode {
    assert(
      node.parent === this,
      `Cannot remove ${node}, it does not belong to ${this}`
    );
    const i = this._children.findIndex((n) => n === node);
    return this.removeChildAtIndex(i);
  }

  removeChildAtIndex(i: number): AstNode {
    assert(i >= 0 && i < this._children.length);
    const removed = this._children.splice(i, 1);
    assert(removed.length === 1);
    const node = removed[0];
    node._parent = null;
    return node;
  }

  removeAllChildren(): Array<AstNode> {
    const out = this._children;
    this._children = [];
    for (const child of out) {
      child._parent = null;
    }
    return out;
  }

  replaceChild(nodeOld: AstNode, nodeNew: AstNode): void {
    const i = this._children.findIndex((p) => p === nodeOld);
    this.replaceChildAtIndex(i, nodeNew);
  }

  replaceChildAtIndex(i: number, nodeNew: AstNode): void {
    assert(i >= 0 && i < this._children.length);
    const nodeOld = this._children[i];
    this._children[i] = nodeNew;
    nodeNew._parent = this;
    nodeOld._parent = null;
  }

  addSiblingBefore(node: AstNode): void {
    const i = this.parent!._children.findIndex((p) => p === this);
    this.parent!._children.splice(i, 0, node);
  }

  addSiblingAfter(node: AstNode): void {
    const i = this.parent!._children.findIndex((p) => p === this);
    this.parent!._children.splice(i + 1, 0, node);
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

  setOpen(v: boolean): this {
    if (v) {
      this._isOpen = true;
    } else {
      delete this._isOpen;
      this.lastChild?.setOpen(false);
    }
    return this;
  }
}
