import { LintContext } from "./LintContext.js";
import { LintMessage, Severity } from "./LintMessage.js";

export abstract class LintRule {
  constructor(name: string) {
    this.name = name;
  }

  /**
   * The rule's internal name, consisting of a letter followed by a 3-digit number.
   * The letter should be "A" for major severity rules, "B" for normal, and "C" for
   * minor.
   */
  public readonly name: string;

  get severity(): Severity {
    const ch = this.name[0];
    return ch === "A"
      ? Severity.MAJOR
      : ch === "B"
      ? Severity.NORMAL
      : Severity.MINOR;
  }

  /**
   * Executes the rule over the document [ctx.root]. Any detected problems should be
   * fixed if [ctx.autoFix] is true, or otherwise reported in the [ctx.messages] array.
   */
  abstract run(ctx: LintContext): void;

  protected emit(ctx: LintContext, message: string): void {
    ctx.messages.push(new LintMessage(this.severity, message));
  }
}
