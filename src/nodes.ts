export { AstNode } from "./nodes/AstNode.js";
export { BoldNode } from "./nodes/BoldNode.js";
export { CodeBlockNode } from "./nodes/CodeBlockNode.js";
export { CommentNode } from "./nodes/CommentNode.js";
export { DocumentNode } from "./nodes/DocumentNode.js";
export { HeaderNode } from "./nodes/HeaderNode.js";
export { ItalicNode } from "./nodes/ItalicNode.js";
export { LinkDefinitionNode } from "./nodes/LinkDefinitionNode.js";
export { LinkNode } from "./nodes/LinkNode.js";
export { ListItemNode } from "./nodes/ListItemNode.js";
export { OrderedListNode } from "./nodes/OrderedListNode.js";
export { ParagraphNode } from "./nodes/ParagraphNode.js";
export { TemplateArgNode } from "./nodes/TemplateArgNode.js";
export { TemplateNode } from "./nodes/TemplateNode.js";
export { TextNode } from "./nodes/TextNode.js";
export { UnorderedListNode } from "./nodes/UnorderedListNode.js";

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
  listItem: "ListItem",
  orderedList: "OrderedList",
  paragraph: "Paragraph",
  template: "Template",
  templateArg: "TemplateArg",
  text: "Text",
  unorderedList: "UnorderedList",
} as const;

export { parse as parseWikitext } from "./wikitext/parse.js";
