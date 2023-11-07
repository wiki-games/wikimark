export { AstNode } from "./nodes/AstNode.js";
export { Bold } from "./nodes/Bold.js";
export { CodeBlock } from "./nodes/CodeBlock.js";
export { Document } from "./nodes/Document.js";
export { Header } from "./nodes/Header.js";
export { Italic } from "./nodes/Italic.js";
export { Link } from "./nodes/Link.js";
export { LinkDefinition } from "./nodes/LinkDefinition.js";
export { Paragraph } from "./nodes/Paragraph.js";
export { Text } from "./nodes/Text.js";

export const nodeTypes = {
  bold: "Bold",
  codeBlock: "CodeBlock",
  document: "Document",
  header: "Header",
  image: "Image",
  italic: "Italic",
  link: "Link",
  linkDefinition: "LinkDefinition",
  paragraph: "Paragraph",
  template: "Template",
  templateArg: "TemplateArg",
  text: "Text",
} as const;

export { parse as parseWikitext } from "./wikitext/parse.js";
