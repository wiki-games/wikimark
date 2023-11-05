import { expect, test } from "vitest";
import { Document, Paragraph, Italic, Text, Header } from "../../src/nodes.js";

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
  expect(ast.toWikimark()).toBe("\n/This text is italic/\n");
});

test("Italic and loose stars", () => {
  const ast = new Document([
    new Header(2, [new Italic([new Text("Italic header")])]),
    new Paragraph([
      new Text("Normal text (with *s) "),
      new Italic([new Text("ita*lic")]),
      new Text(" more text"),
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
      ""
    ].join("\n")
  );
  expect(ast.toWikimark()).toBe(
    [
      "",
      "## /Italic header/",
      "",
      "Normal text (with \\*s) /ita\\*lic/ more text",
      ""
    ].join("\n")
  );
});
