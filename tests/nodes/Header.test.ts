import { expect, test } from "vitest";
import { Document, Header, Paragraph, Text } from "../../src/nodes.js";

test("Simple header", () => {
  const ast = new Document([new Header(1, [new Text("Header 1")])]);
  expect(ast.toPlainText()).toBe("Header 1");
  expect(ast.toWikimark()).toBe("\n# Header 1\n");
  expect(ast.toDebugTree()).toBe(
    [
      "Document:", //
      "  Header[1]:",
      "    Text: Header 1",
      "",
    ].join("\n")
  );
});

test("Header and paragraphs", () => {
  const ast = new Document([
    new Paragraph([new Text("First paragraph")]),
    new Header(2, [new Text("Some header")]),
    new Paragraph([new Text("Last paragraph")]),
  ]);
  expect(ast.toWikimark()).toBe(
    [
      "",
      "First paragraph",
      "",
      "",
      "## Some header",
      "",
      "Last paragraph",
      "",
    ].join("\n")
  );
  expect(ast.toDebugTree()).toBe(
    [
      "Document:",
      "  Paragraph:",
      "    Text: First paragraph",
      "  Header[2]:",
      "    Text: Some header",
      "  Paragraph:",
      "    Text: Last paragraph",
      "",
    ].join("\n")
  );
});

test("Multiple headers", () => {
  const ast = new Document([
    new Header(2, [new Text("First header")]),
    new Header(4, [new Text("Second header")]),
    new Header(6, [new Text("Third header")]),
  ]);
  expect(ast.toWikimark()).toBe(
    [
      "",
      "## First header",
      "",
      "#### Second header",
      "",
      "###### Third header",
      "",
    ].join("\n")
  );
  expect(ast.toDebugTree()).toBe(
    [
      "Document:",
      "  Header[2]:",
      "    Text: First header",
      "  Header[4]:",
      "    Text: Second header",
      "  Header[6]:",
      "    Text: Third header",
      "",
    ].join("\n")
  );
});

test("Header with hash signs", () => {
  const ast = new Document([
    new Header(1, [new Text("# one ## two #")]),
    new Header(2, [new Text("- also header")]),
  ]);
  expect(ast.toWikimark()).toBe(
    [
      "", //
      "# # one ## two #",
      "",
      "## - also header",
      ""
    ].join("\n")
  );
  expect(ast.toDebugTree()).toBe(
    [
      "Document:", //
      "  Header[1]:",
      "    Text: # one ## two #",
      "  Header[2]:",
      "    Text: - also header",
      "",
    ].join("\n")
  );
});
