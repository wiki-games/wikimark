import { AstNode, BoldNode, ItalicNode, nodeTypes } from "../../../nodes.js";
import { LintContext } from "../LintContext.js";
import { LintRule } from "../LintRule.js";

/**
 * This rule ensures that if a bold or italic node contains another bold or italic
 * node inside, then the outer node uses "fancy delimiters":
 * ```
 * BAD:  *outer bold *inner* more text*
 * GOOD: {*outer bold *inner* more text*}
 * ```
 */
export class B001 extends LintRule {
  constructor() {
    super("B001");
  }

  override run(ctx: LintContext): void {
    this._runForChildren(ctx, ctx.root);
  }

  private _runForChildren(ctx: LintContext, parent: AstNode): void {
    for (const node of parent.children) {
      const type = node.type;
      if (
        (node instanceof BoldNode || node instanceof ItalicNode) &&
        !node.useFancyDelimiters &&
        node.findChildOfType(type) !== null
      ) {
        if (ctx.autoFix) {
          node.useFancyDelimiters = true;
        } else {
          const symbol = node instanceof BoldNode ? "*" : "/";
          this.emit(
            ctx,
            `This ${type} node should use directional delimiters {${symbol} ... ` +
              `${symbol}} because it contains another ${type} node inside.`
          );
        }
      }
      this._runForChildren(ctx, node);
    }
  }
}
