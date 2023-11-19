export { AstNode } from "./nodes/AstNode.js";
export { BoldNode } from "./nodes/BoldNode.js";
export { CodeBlockNode } from "./nodes/CodeBlockNode.js";
export { CommentNode } from "./nodes/CommentNode.js";
export { DocumentNode } from "./nodes/DocumentNode.js";
export { HardBreakNode } from "./nodes/HardBreakNode.js";
export { HeaderNode } from "./nodes/HeaderNode.js";
export { HtmlElementNode } from "./nodes/HtmlElementNode.js";
export { ImageNode } from "./nodes/ImageNode.js";
export { ItalicNode } from "./nodes/ItalicNode.js";
export { LinkDefinitionNode } from "./nodes/LinkDefinitionNode.js";
export { LinkNode } from "./nodes/LinkNode.js";
export { ListItemNode } from "./nodes/ListItemNode.js";
export { OrderedListNode } from "./nodes/OrderedListNode.js";
export { ParagraphNode } from "./nodes/ParagraphNode.js";
export { SubscriptNode } from "./nodes/SubscriptNode.js";
export { SuperscriptNode } from "./nodes/SuperscriptNode.js";
export { TemplateArgNode } from "./nodes/TemplateArgNode.js";
export { TemplateNode } from "./nodes/TemplateNode.js";
export { TextNode } from "./nodes/TextNode.js";
export { ThematicBreakNode } from "./nodes/ThematicBreakNode.js";
export { UnorderedListNode } from "./nodes/UnorderedListNode.js";

export const nodeTypes = {
  bold: "Bold",
  codeBlock: "CodeBlock",
  comment: "Comment",
  document: "Document",
  hardBreak: "HardBreak",
  header: "Header",
  htmlElement: "HtmlElement",
  image: "Image",
  italic: "Italic",
  link: "Link",
  linkDefinition: "LinkDefinition",
  listItem: "ListItem",
  orderedList: "OrderedList",
  paragraph: "Paragraph",
  subscript: "Subscript",
  superscript: "Superscript",
  template: "Template",
  templateArg: "TemplateArg",
  thematicBreak: "ThematicBreak",
  text: "Text",
  unorderedList: "UnorderedList",
} as const;

export { parse as parseWikitext } from "./wikitext/parse.js";
