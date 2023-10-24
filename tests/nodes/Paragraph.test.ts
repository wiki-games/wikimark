import { expect, test } from "vitest";
import { Document, Paragraph, Text } from "../../src/nodes.js";

test("Empty paragraph", () => {
  const ast = new Paragraph();
  expect(ast.toWikimark()).toBe("\n");
  expect(ast.toDebugTree()).toBe("Paragraph\n");
});

test("Simple paragraph", () => {
  const ast = new Paragraph([new Text("Hello, world")]);
  expect(ast.toWikimark()).toBe("Hello, world\n");
  expect(ast.toDebugTree()).toBe(
    "Paragraph:\n" + //
      "  Text: Hello, world\n"
  );
});

test("Multiple paragraphs", () => {
  const ast = new Document([
    new Paragraph([new Text("First paragraph")]),
    new Paragraph([new Text("Another paragraph")]),
    new Paragraph([new Text("One more"), new Text(" paragraph")]),
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
      "    Text: One more",
      "    Text:  paragraph",
      "",
    ].join("\n")
  );
});
