export { AstNode } from "./nodes/AstNode.js";
export { CodeBlock } from "./nodes/CodeBlock.js";
export { Document } from "./nodes/Document.js";
export { Header } from "./nodes/Header.js";
export { Italic } from "./nodes/Italic.js";
export { Paragraph } from "./nodes/Paragraph.js";
export { Text } from "./nodes/Text.js";

export const nodeTypes = {
  bold: "Bold",
  codeBlock: "CodeBlock",
  document: "Document",
  header: "Header",
  italic: "Italic",
  link: "Link",
  paragraph: "Paragraph",
  template: "Template",
  templateArg: "TemplateArg",
  text: "Text",
} as const;
