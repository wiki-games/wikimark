import { LintContext } from "../LintContext.js";
import { LintRule } from "../LintRule.js";

/**
 * This rule checks that the `.parent` property of the root node is null.
 * 
 * When this rule is violated, it is always a system error, not user error (i.e. under
 * normal circumstances it should never occur).
 */
export class A002 extends LintRule {
  constructor() {
    super("A002");
  }

  override run(ctx: LintContext): void {
    if (ctx.root.parent !== null) {
      if (ctx.autoFix) {
        (ctx.root as any)._parent = null;
      } else {
        this.emit(
          ctx,
          `The [.parent] property of the root Document node must be null.`
        );
      }
    }
  }
}
