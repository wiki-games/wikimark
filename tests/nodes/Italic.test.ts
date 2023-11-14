import { expect, test } from "vitest";
import {
  DocumentNode,
  ParagraphNode,
  ItalicNode,
  TextNode,
  HeaderNode,
} from "../../src/nodes.js";

test("Simple italic", () => {
  const ast = new DocumentNode([
    new ParagraphNode([new ItalicNode([new TextNode("This text is italic")])]),
  ]);
  expect(ast.toPlainText()).toBe("This text is italic");
  expect(ast.toDebugTree()).toBe(
    [
      "Document:",
      "  Paragraph:",
      "    Italic:",
      "      Text: This text is italic",
      "",
    ].join("\n")
  );
  expect(ast.toWikimark()).toBe("\n{/This text is italic/}\n");
});

test("Italic and loose stars", () => {
  const ast = new DocumentNode([
    new HeaderNode(2, [new ItalicNode([new TextNode("Italic header")])]),
    new ParagraphNode([
      new TextNode("Normal text (with *s) "),
      new ItalicNode([new TextNode("ita*lic")]),
      new TextNode(" more text"),
    ]),
  ]);
  expect(ast.toDebugTree()).toBe(
    [
      "Document:",
      "  Header[2]:",
      "    Italic:",
      "      Text: Italic header",
      "  Paragraph:",
      "    Text: Normal text (with *s) ",
      "    Italic:",
      "      Text: ita*lic",
      "    Text:  more text",
      "",
    ].join("\n")
  );
  expect(ast.toWikimark()).toBe(
    [
      "",
      "## {/Italic header/}",
      "",
      "Normal text (with *s) {/ita*lic/} more text",
      "",
    ].join("\n")
  );
});
