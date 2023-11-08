import { DocumentNode } from "../../../nodes.js";
import { LintContext } from "../LintContext.js";
import { LintRule } from "../LintRule.js";

/**
 * This rule checks that the root node is a DocumentNode.
 * 
 * This rule cannot be autofixed, because even if create a new DocumentNode and 
 * move all the content there, there is no guarantee that the user will retrieve it
 * back from the context. Thus, an attempt to fix the problem might make it worse.
 */
export class A001 extends LintRule {
  constructor() {
    super("A001");
  }

  override run(ctx: LintContext): void {
    if (!(ctx.root instanceof DocumentNode)) {
      this.emit(ctx, `The root node must be of type DocumentNode.`);
    }
  }
}
