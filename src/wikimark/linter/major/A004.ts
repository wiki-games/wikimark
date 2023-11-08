import { AstNode, LinkDefinitionNode, LinkNode } from "../../../nodes.js";
import { LintContext } from "../LintContext.js";
import { LintRule } from "../LintRule.js";

/**
 * This rule checks that if a LinkNode's target is different from its display text,
 * then there must be a corresponding link definition somewhere in the document.
 *
 * If this rule is not fixed, then rendering this document into Wikimark would produce
 * a wrong link target.
 */
export class A004 extends LintRule {
  constructor() {
    super("A004");
  }

  override run(ctx: LintContext): void {
    this._runForChildren(ctx, ctx.root);
  }

  private _runForChildren(ctx: LintContext, parent: AstNode): void {
    const doc = ctx.root;
    for (const node of parent.children) {
      if (node instanceof LinkNode) {
        const actualTarget = node.target;
        const impliedTarget = node.getImpliedTarget();
        if (
          actualTarget !== impliedTarget &&
          doc.resolveLinkTarget(impliedTarget) === null
        ) {
          if (ctx.autoFix) {
            doc.addChild(new LinkDefinitionNode(impliedTarget, actualTarget));
          } else {
            this.emit(
              ctx,
              "Link node's target cannot be derived from its inner text. Create a " +
                "separate LinkDefinition node to specify the target for this link."
            );
          }
        }
      }
      this._runForChildren(ctx, node);
    }
  }
}
