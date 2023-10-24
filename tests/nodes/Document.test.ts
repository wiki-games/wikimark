import { expect, test } from "vitest";
import { Document, Paragraph, Text } from "../../src/nodes.js";

test("Empty document", () => {
  const ast = new Document();
  expect(ast.toWikimark()).toBe("");
  expect(ast.toDebugTree()).toBe("Document\n");
});

test("Simple document", () => {
  const ast = new Document([new Paragraph([new Text("Hello, world!")])]);
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
