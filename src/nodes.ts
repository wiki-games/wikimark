export { AstNode } from "./nodes/AstNode.js";
export { Document } from "./nodes/Document.js";
export { Header } from "./nodes/Header.js";
export { Paragraph } from "./nodes/Paragraph.js";
export { Text } from "./nodes/Text.js";

export const nodeTypes = {
  bold: "Bold",
  document: "Document",
  header: "Header",
  italic: "Italic",
  link: "Link",
  paragraph: "Paragraph",
  template: "Template",
  template_arg: "TemplateArg",
  text: "Text",
} as const;
