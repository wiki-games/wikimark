export { AstNode } from "./nodes/AstNode.js";
export { BoldNode } from "./nodes/BoldNode.js";
export { CodeBlockNode } from "./nodes/CodeBlockNode.js";
export { CommentNode } from "./nodes/CommentNode.js";
export { DocumentNode } from "./nodes/DocumentNode.js";
export { HeaderNode } from "./nodes/HeaderNode.js";
export { ItalicNode } from "./nodes/ItalicNode.js";
export { LinkNode } from "./nodes/LinkNode.js";
export { LinkDefinitionNode } from "./nodes/LinkDefinitionNode.js";
export { ParagraphNode } from "./nodes/ParagraphNode.js";
export { TextNode } from "./nodes/TextNode.js";

export const nodeTypes = {
  bold: "Bold",
  codeBlock: "CodeBlock",
  comment: "Comment",
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
