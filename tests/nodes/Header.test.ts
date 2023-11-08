import { expect, test } from "vitest";
import {
  DocumentNode,
  HeaderNode,
  ParagraphNode,
  TextNode,
} from "../../src/nodes.js";

test("Simple header", () => {
  const ast = new DocumentNode([new HeaderNode(1, [new TextNode("Header 1")])]);
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
  const ast = new DocumentNode([
    new ParagraphNode([new TextNode("First paragraph")]),
    new HeaderNode(2, [new TextNode("Some header")]),
    new ParagraphNode([new TextNode("Last paragraph")]),
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
  const ast = new DocumentNode([
    new HeaderNode(2, [new TextNode("First header")]),
    new HeaderNode(4, [new TextNode("Second header")]),
    new HeaderNode(6, [new TextNode("Third header")]),
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
  const ast = new DocumentNode([
    new HeaderNode(1, [new TextNode("# one ## two #")]),
    new HeaderNode(2, [new TextNode("- also header")]),
  ]);
  expect(ast.toWikimark()).toBe(
    [
      "", //
      "# # one ## two #",
      "",
      "## - also header",
      "",
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
