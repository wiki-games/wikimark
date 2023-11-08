import { DocumentNode } from "../../nodes.js";
import { LintMessage } from "./LintMessage.js";

export type LintContext = {
  root: DocumentNode;
  autoFix: boolean;
  messages: Array<LintMessage>;
};
