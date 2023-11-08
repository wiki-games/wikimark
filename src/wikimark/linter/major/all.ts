import { LintRule } from "../LintRule.js";
import { A001 } from "./A001.js";
import { A002 } from "./A002.js";
import { A003 } from "./A003.js";

export const allMajorRules: Array<LintRule> = [
  new A001(),
  new A002(),
  new A003(),
];
