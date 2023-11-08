import { expect, test } from "vitest";
import { DocumentNode, ParagraphNode, TextNode } from "../../src/nodes.js";

test("Empty paragraph", () => {
  const ast = new ParagraphNode();
  expect(ast.toWikimark()).toBe("\n");
  expect(ast.toDebugTree()).toBe("Paragraph\n");
});

test("Simple paragraph", () => {
  const ast = new ParagraphNode([new TextNode("Hello, world")]);
  expect(ast.toWikimark()).toBe("Hello, world\n");
  expect(ast.toDebugTree()).toBe(
    "Paragraph:\n" + //
      "  Text: Hello, world\n"
  );
});

test("Multiple paragraphs", () => {
  const ast = new DocumentNode([
    new ParagraphNode([new TextNode("First paragraph")]),
    new ParagraphNode([new TextNode("Another paragraph")]),
    new ParagraphNode([new TextNode("One more"), new TextNode(" paragraph")]),
  ]);
  expect(ast.toWikimark()).toBe(
    [
      "",
      "First paragraph",
      "",
      "Another paragraph",
      "",
      "One more paragraph",
      "",
    ].join("\n")
  );
  expect(ast.toDebugTree()).toBe(
    [
      "Document:",
      "  Paragraph:",
      "    Text: First paragraph",
      "  Paragraph:",
      "    Text: Another paragraph",
      "  Paragraph:",
      "    Text: One more paragraph",
      "",
    ].join("\n")
  );
});
