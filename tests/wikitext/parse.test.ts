import { expect, test, describe } from "vitest";
import { parse } from "../../src/wikitext/parse.js";
import {
  AstNode,
  CodeBlock,
  Document,
  Header,
  Paragraph,
  Text,
} from "../../src/nodes.js";

test("Empty document", () => {
  expect(parse("")).toEqual(new Document());
  expect(parse("  \t  ")).toEqual(new Document());
  expect(parse("\n\r\n\r  \r")).toEqual(new Document());
});

describe("Paragraphs", () => {
  test("Simple text", () => {
    expect(parse("Simple text")).toEqual(
      new Document([new Paragraph([new Text("Simple text")])])
    );
  });

  test("Multi-line paragraph", () => {
    expect(
      parse(
        "This  paragraph\n" +
          "contains multiple lines\r\n" +
          "even if it's just \r" +
          "one sentence.\n"
      )
    ).toEqual(
      new Document([
        new Paragraph([
          new Text(
            // TODO: fix extra spaces
            "This paragraph contains multiple lines even if it's just  one sentence. "
          ),
        ]),
      ])
    );
  });

  test("Multiple paragraphs", () => {
    expect(
      parse(
        "Paragraph one.\n\n" +
          "Another paragraph that\n" +
          "may span several lines.\n\n" +
          "\n\n" +
          "Third paragraph, just for fun.\n\n\n"
      )
    ).toEqual(
      new Document([
        new Paragraph([new Text("Paragraph one. ")]),
        new Paragraph([
          new Text("Another paragraph that may span several lines. "),
        ]),
        new Paragraph([new Text("Third paragraph, just for fun. ")]),
      ])
    );
  });

  test("Paragraph with a comment", () => {
    expect(parse("Para <!-- 1\n\n2\n\n  --> one")).toEqual(
      new Document([new Paragraph([new Text("Para  one")])])
    );
  });
});

describe("Headers", () => {
  test("Simple header", () => {
    expect(parse("=Simple=")).toEqual(
      new Document([new Header(1, [new Text("Simple")])])
    );
  });

  test("Not a header", () => {
    expect(parse("==\n")).toEqual(
      new Document([new Paragraph([new Text("== ")])])
    );
  });

  test("Not a header again", () => {
    expect(parse("=== Looks like a header")).toEqual(
      new Document([new Paragraph([new Text("=== Looks like a header")])])
    );
  });

  test("Header with whitespace", () => {
    expect(parse("==  Header two ==")).toEqual(
      new Document([new Header(2, [new Text("Header two")])])
    );
  });

  test("Mismatched header, left", () => {
    expect(parse("=== Another header =")).toEqual(
      new Document([new Header(1, [new Text("== Another header")])])
    );
  });

  test("Mismatched header, right", () => {
    expect(parse("=  Another header ====")).toEqual(
      new Document([new Header(1, [new Text("Another header ===")])])
    );
  });

  test("Header terminates a paragraph", () => {
    expect(parse("Hello,\n==world==\n!")).toEqual(
      new Document([
        new Paragraph([new Text("Hello, ")]),
        new Header(2, [new Text("world")]),
        new Paragraph([new Text("!")]),
      ])
    );
  });

  test("Consecutive headers", () => {
    expect(parse("==H1==\n==H2==\n==H3==\n")).toEqual(
      new Document([
        new Header(2, [new Text("H1")]),
        new Header(2, [new Text("H2")]),
        new Header(2, [new Text("H3")]),
      ])
    );
  });

  test("Different level headers", () => {
    expect(
      parse(
        "=H1=\n==H2==\n===H3===\n====H4====\n=====H5=====\n======H6======\n"
      )
    ).toEqual(
      new Document([
        new Header(1, [new Text("H1")]),
        new Header(2, [new Text("H2")]),
        new Header(3, [new Text("H3")]),
        new Header(4, [new Text("H4")]),
        new Header(5, [new Text("H5")]),
        new Header(6, [new Text("H6")]),
      ])
    );
  });

  test("Header is not too long", () => {
    expect(parse("==========H2==\n==H2==========")).toEqual(
      new Document([
        new Header(2, [new Text("========H2")]),
        new Header(2, [new Text("H2========")]),
      ])
    );
  });

  test("Header is too long but still ok", () => {
    expect(parse("========== H6 ==========")).toEqual(
      new Document([new Header(6, [new Text("==== H6 ====")])])
    );
  });

  test("Header with a comment", () => {
    expect(parse("== Header<!--\n\n\n--> one==")).toEqual(
      new Document([new Header(2, [new Text("Header one")])])
    );
  });

  test.fails("Header with <pre>", () => {
    expect(parse("== Header <pre>\nhohoho\n</pre> ==")).toEqual(
      new Document([
        new Header(2, [new Text("Header "), new CodeBlock("\nhohoho\n")]),
      ])
    );
  });
});
