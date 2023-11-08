import { AstNode } from "../../../nodes.js";
import { LintContext } from "../LintContext.js";
import { LintRule } from "../LintRule.js";

/**
 * This rule checks that all nodes in the document tree have their [.parent] property
 * set correctly.
 */
export class A003 extends LintRule {
  constructor() {
    super("A003");
  }

  override run(ctx: LintContext): void {
    this._runForChildren(ctx, ctx.root);
  }

  private _runForChildren(ctx: LintContext, node: AstNode): void{ 
    for (const child of node.children) {
      if (child.parent !== node) {
        if (ctx.autoFix) {
          (child as any)._parent = node;
        } else {

        }
      }
      this._runForChildren(ctx, child);
    }
  }
}
