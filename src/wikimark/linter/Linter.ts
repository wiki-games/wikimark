import { DocumentNode } from "../../nodes.js";
import { LintContext } from "./LintContext.js";
import { LintRule } from "./LintRule.js";
import { allMajorRules } from "./major/all.js";
import { allMinorRules } from "./minor/all.js";
import { allNormalRules } from "./normal/all.js";

export class Linter {
  constructor() {
    this._rules = [];
    this._rules.push(...allMajorRules);
    this._rules.push(...allNormalRules);
    this._rules.push(...allMinorRules);
  }

  private _rules: Array<LintRule>;

  lint(root: DocumentNode, fix: boolean) {
    const context: LintContext = {root: root, autoFix: fix, messages: []};
    for (const rule of this._rules) {
      rule.run(context);
    }
  }
}
