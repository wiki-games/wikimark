import { expect, test } from "vitest";
import { DocumentNode, ParagraphNode, TextNode } from "../../src/nodes.js";

test("Empty document", () => {
  const ast = new DocumentNode();
  expect(ast.toWikimark()).toBe("");
  expect(ast.toDebugTree()).toBe("Document\n");
});

test("Simple document", () => {
  const ast = new DocumentNode([
    new ParagraphNode([new TextNode("Hello, world!")]),
  ]);
  expect(ast.toWikimark()).toBe("\nHello, world!\n");
  expect(ast.toDebugTree()).toBe(
    [
      "Document:", //
      "  Paragraph:",
      "    Text: Hello, world!",
      "",
    ].join("\n")
  );
});
