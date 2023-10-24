import { expect, test } from "vitest";
import { Document, Paragraph, Italic, Text } from "../../src/nodes.js";

test("Simple italic", () => {
  const ast = new Document([
    new Paragraph([new Italic([new Text("This text is italic")])]),
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
  expect(ast.toWikimark()).toBe(
    "\n*This text is italic*\n"
  )
});
