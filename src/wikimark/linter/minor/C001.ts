import { LintContext } from "../LintContext.js";
import { LintRule } from "../LintRule.js";

/**
 * This rule checks for any link definition node that can be replaced with a "bleeding"
 * link. That is, link definitions of the form
 * ```
 * [targeting]: target
 * ```
 * In this case the link could be simply `[target]ing`.
 */
export class C001 extends LintRule {
  constructor() { super("C001"); }
  
  override run(ctx: LintContext): void {
    ctx;
    throw new Error("Method not implemented.");
  }
}
