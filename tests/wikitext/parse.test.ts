import { expect, test, describe } from "vitest";
import { parse } from "../../src/wikitext/parse.js";
import {
  AstNode,
  BoldNode,
  CodeBlockNode,
  DocumentNode,
  HeaderNode,
  ItalicNode,
  LinkNode,
  ParagraphNode,
  TextNode,
} from "../../src/nodes.js";

test("Empty document", () => {
  expect(parse("", "")).toEqual(new DocumentNode());
  expect(parse("  \t  ", "")).toEqual(new DocumentNode());
  expect(parse("\n\r\n\r  \r", "")).toEqual(new DocumentNode());
});

describe("Paragraphs", () => {
  test("Simple text", () => {
    expect(parse("Simple text", "")).toEqual(
      new DocumentNode([new ParagraphNode([new TextNode("Simple text")])])
    );
  });

  test("Multi-line paragraph", () => {
    expect(
      parse(
        "This  paragraph\n" +
          "contains multiple lines\r\n" +
          "even if it's just \r" +
          "one sentence.\n",
        ""
      )
    ).toEqual(
      new DocumentNode([
        new ParagraphNode([
          new TextNode(
            // TODO: fix extra spaces
            "This paragraph contains multiple lines even if it's just  one sentence."
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
          "Third paragraph, just for fun.\n\n\n",
        ""
      )
    ).toEqual(
      new DocumentNode([
        new ParagraphNode([new TextNode("Paragraph one.")]),
        new ParagraphNode([
          new TextNode("Another paragraph that may span several lines."),
        ]),
        new ParagraphNode([new TextNode("Third paragraph, just for fun.")]),
      ])
    );
  });

  test("Paragraph with a comment", () => {
    expect(parse("Para <!-- 1\n\n2\n\n  --> one", "")).toEqual(
      new DocumentNode([new ParagraphNode([new TextNode("Para  one")])])
    );
  });
});

describe("Headers", () => {
  test("Simple header", () => {
    expect(parse("=Simple=", "")).toEqual(
      new DocumentNode([new HeaderNode(1, [new TextNode("Simple")])])
    );
  });

  test("Not a header", () => {
    expect(parse("==\n", "")).toEqual(
      new DocumentNode([new ParagraphNode([new TextNode("==")])])
    );
  });

  test("Not a header again", () => {
    expect(parse("=== Looks like a header", "")).toEqual(
      new DocumentNode([
        new ParagraphNode([new TextNode("=== Looks like a header")]),
      ])
    );
  });

  test("Header with whitespace", () => {
    expect(parse("==  Header two ==", "")).toEqual(
      new DocumentNode([new HeaderNode(2, [new TextNode("Header two")])])
    );
  });

  test("Mismatched header, left", () => {
    expect(parse("=== Another header =", "")).toEqual(
      new DocumentNode([new HeaderNode(1, [new TextNode("== Another header")])])
    );
  });

  test("Mismatched header, right", () => {
    expect(parse("=  Another header ====", "")).toEqual(
      new DocumentNode([
        new HeaderNode(1, [new TextNode("Another header ===")]),
      ])
    );
  });

  test("Header terminates a paragraph", () => {
    expect(parse("Hello,\n==world==\n!", "")).toEqual(
      new DocumentNode([
        new ParagraphNode([new TextNode("Hello,")]),
        new HeaderNode(2, [new TextNode("world")]),
        new ParagraphNode([new TextNode("!")]),
      ])
    );
  });

  test("Consecutive headers", () => {
    expect(parse("==H1==\n==H2==\n==H3==\n", "")).toEqual(
      new DocumentNode([
        new HeaderNode(2, [new TextNode("H1")]),
        new HeaderNode(2, [new TextNode("H2")]),
        new HeaderNode(2, [new TextNode("H3")]),
      ])
    );
  });

  test("Different level headers", () => {
    expect(
      parse(
        "=H1=\n==H2==\n===H3===\n====H4====\n=====H5=====\n======H6======\n",
        ""
      )
    ).toEqual(
      new DocumentNode([
        new HeaderNode(1, [new TextNode("H1")]),
        new HeaderNode(2, [new TextNode("H2")]),
        new HeaderNode(3, [new TextNode("H3")]),
        new HeaderNode(4, [new TextNode("H4")]),
        new HeaderNode(5, [new TextNode("H5")]),
        new HeaderNode(6, [new TextNode("H6")]),
      ])
    );
  });

  test("Header is not too long", () => {
    expect(parse("==========H2==\n==H2==========", "")).toEqual(
      new DocumentNode([
        new HeaderNode(2, [new TextNode("========H2")]),
        new HeaderNode(2, [new TextNode("H2========")]),
      ])
    );
  });

  test("Header is too long but still ok", () => {
    expect(parse("========== H6 ==========", "")).toEqual(
      new DocumentNode([new HeaderNode(6, [new TextNode("==== H6 ====")])])
    );
  });

  test("Header with a comment", () => {
    expect(parse("== Header<!--\n\n\n--> one==", "")).toEqual(
      new DocumentNode([new HeaderNode(2, [new TextNode("Header one")])])
    );
  });

  test.fails("Header with <pre>", () => {
    expect(parse("== Header <pre>\nhohoho\n</pre> ==", "")).toEqual(
      new DocumentNode([
        new HeaderNode(2, [
          new TextNode("Header "),
          new CodeBlockNode("\nhohoho\n"),
        ]),
      ])
    );
  });
});

describe("Bold/italic", () => {
  function check(text: string, nodes: Array<AstNode>) {
    expect(parse(text, "")).toEqual(
      new DocumentNode([new ParagraphNode(nodes)])
    );
  }

  test("Starts with 1 quote", () => {
    check("'text", [new TextNode("'text")]);
    check("'text'", [new TextNode("'text'")]);
    check("'text''", [new TextNode("'text"), new ItalicNode()]);
    check("'text'''", [new TextNode("'text"), new BoldNode()]);
    check("'text''''", [new TextNode("'text'"), new BoldNode()]);
    check("'text'''''", [
      new TextNode("'text"),
      new BoldNode([new ItalicNode()]),
    ]);
    check("'text''''''", [
      new TextNode("'text'"),
      new BoldNode([new ItalicNode()]),
    ]);
    check("'text'''''''", [
      new TextNode("'text''"),
      new BoldNode([new ItalicNode()]),
    ]);
    check("'text''''''''", [
      new TextNode("'text'''"),
      new BoldNode([new ItalicNode()]),
    ]);
  });

  test("Starts with 2 quotes", () => {
    check("''text", [new ItalicNode([new TextNode("text")])]);
    check("''text'", [new ItalicNode([new TextNode("text'")])]);
    check("''text''", [new ItalicNode([new TextNode("text")])]);
    check("''text'''", [new ItalicNode([new TextNode("text'")])]);
    check("''text''''", [new ItalicNode([new TextNode("text''")])]);
    check("''text'''''", [
      new ItalicNode([new TextNode("text")]),
      new BoldNode(),
    ]);
    check("''text''''''", [
      new ItalicNode([new TextNode("text'")]),
      new BoldNode(),
    ]);
    check("''text'''''''", [
      new ItalicNode([new TextNode("text''")]),
      new BoldNode(),
    ]);
    check("''text''''''''", [
      new ItalicNode([new TextNode("text'''")]),
      new BoldNode(),
    ]);
  });

  test("Starts with 3 quotes", () => {
    check("'''text", [new BoldNode([new TextNode("text")])]);
    check("'''text'", [new BoldNode([new TextNode("text'")])]);
    check("'''text''", [
      new TextNode("'"),
      new ItalicNode([new TextNode("text")]),
    ]);
    check("'''text'''", [new BoldNode([new TextNode("text")])]);
    check("'''text''''", [new BoldNode([new TextNode("text'")])]);
    check("'''text'''''", [
      new BoldNode([new TextNode("text")]),
      new ItalicNode(),
    ]);
    check("'''text''''''", [
      new BoldNode([new TextNode("text'")]),
      new ItalicNode(),
    ]);
    check("'''text'''''''", [
      new BoldNode([new TextNode("text''")]),
      new ItalicNode(),
    ]);
    check("'''text''''''''", [
      new BoldNode([new TextNode("text'''")]),
      new ItalicNode(),
    ]);
  });

  test("Starts with 4 quotes", () => {
    check("''''text", [
      new TextNode("'"),
      new BoldNode([new TextNode("text")]),
    ]);
    check("''''text'", [
      new TextNode("'"),
      new BoldNode([new TextNode("text'")]),
    ]);
    check("''''text''", [
      new TextNode("''"),
      new ItalicNode([new TextNode("text")]),
    ]);
    check("''''text'''", [
      new TextNode("'"),
      new BoldNode([new TextNode("text")]),
    ]);
    check("''''text''''", [
      new TextNode("'"),
      new BoldNode([new TextNode("text'")]),
    ]);
    check("''''text'''''", [
      new TextNode("'"),
      new BoldNode([new TextNode("text")]),
      new ItalicNode(),
    ]);
    check("''''text''''''", [
      new TextNode("'"),
      new BoldNode([new TextNode("text'")]),
      new ItalicNode(),
    ]);
    check("''''text'''''''", [
      new TextNode("'"),
      new BoldNode([new TextNode("text''")]),
      new ItalicNode(),
    ]);
    check("''''text''''''''", [
      new TextNode("'"),
      new BoldNode([new TextNode("text'''")]),
      new ItalicNode(),
    ]);
  });

  test("Starts with 5 quotes", () => {
    check("'''''text", [
      new BoldNode([new ItalicNode([new TextNode("text")])]),
    ]);
    check("'''''text'", [
      new BoldNode([new ItalicNode([new TextNode("text'")])]),
    ]);
    check("'''''text''", [
      new BoldNode([new ItalicNode([new TextNode("text")])]),
    ]);
    check("'''''text'''", [
      new ItalicNode([new BoldNode([new TextNode("text")])]),
    ]);
    check("'''''text''''", [
      new ItalicNode([new BoldNode([new TextNode("text'")])]),
    ]);
    check("'''''text'''''", [
      new BoldNode([new ItalicNode([new TextNode("text")])]),
    ]);
    check("'''''text''''''", [
      new BoldNode([new ItalicNode([new TextNode("text'")])]),
    ]);
    check("'''''text'''''''", [
      new BoldNode([new ItalicNode([new TextNode("text''")])]),
    ]);
    check("'''''text''''''''", [
      new BoldNode([new ItalicNode([new TextNode("text'''")])]),
    ]);
  });

  test("Starts with 6 quotes", () => {
    check("''''''text", [
      new TextNode("'"),
      new BoldNode([new ItalicNode([new TextNode("text")])]),
    ]);
    check("''''''text'", [
      new TextNode("'"),
      new BoldNode([new ItalicNode([new TextNode("text'")])]),
    ]);
    check("''''''text''", [
      new TextNode("'"),
      new BoldNode([new ItalicNode([new TextNode("text")])]),
    ]);
    check("''''''text'''", [
      new TextNode("'"),
      new ItalicNode([new BoldNode([new TextNode("text")])]),
    ]);
    check("''''''text''''", [
      new TextNode("'"),
      new ItalicNode([new BoldNode([new TextNode("text'")])]),
    ]);
    check("''''''text'''''", [
      new TextNode("'"),
      new BoldNode([new ItalicNode([new TextNode("text")])]),
    ]);
    check("''''''text''''''", [
      new TextNode("'"),
      new BoldNode([new ItalicNode([new TextNode("text'")])]),
    ]);
    check("''''''text'''''''", [
      new TextNode("'"),
      new BoldNode([new ItalicNode([new TextNode("text''")])]),
    ]);
    check("''''''text''''''''", [
      new TextNode("'"),
      new BoldNode([new ItalicNode([new TextNode("text'''")])]),
    ]);
  });

  test("Starts with even more quotes", () => {
    check("'''''''text'''''''", [
      new TextNode("''"),
      new BoldNode([new ItalicNode([new TextNode("text''")])]),
    ]);
    check("''''''''text''''''''", [
      new TextNode("'''"),
      new BoldNode([new ItalicNode([new TextNode("text'''")])]),
    ]);
  });

  test("Bold+italic closes in separate places", () => {
    check("'''''one'' two''' three", [
      new BoldNode([
        new ItalicNode([new TextNode("one")]),
        new TextNode(" two"),
      ]),
      new TextNode(" three"),
    ]);
    check("'''''one''' two'' three", [
      new ItalicNode([
        new BoldNode([new TextNode("one")]),
        new TextNode(" two"),
      ]),
      new TextNode(" three"),
    ]);
  });

  test("Overlapping bold/italic ranges", () => {
    check("''one '''two'' three'''", [
      new ItalicNode([
        new TextNode("one "),
        new BoldNode([new TextNode("two")]),
      ]),
      new BoldNode([new TextNode(" three")]),
    ]);
  });

  test("Unclosed bold and italic ranges", () => {
    check("'''one ''two'''", [
      new BoldNode([
        new TextNode("one "),
        new ItalicNode([new TextNode("two")]),
      ]),
      new ItalicNode(),
    ]);
    check("''one '''two''", [
      new ItalicNode([
        new TextNode("one "),
        new BoldNode([new TextNode("two")]),
      ]),
      new BoldNode(),
    ]);
  });

  test("Separate bold and italic closed with '''''", () => {
    check("''one '''two''''' three", [
      new ItalicNode([
        new TextNode("one "),
        new BoldNode([new TextNode("two")]),
      ]),
      new TextNode(" three"),
    ]);
    check("'''one ''two''''' three", [
      new BoldNode([
        new TextNode("one "),
        new ItalicNode([new TextNode("two")]),
      ]),
      new TextNode(" three"),
    ]);
  });
});

describe("Links", () => {
  test("Simple link", () => {
    expect(parse("[[Hello]]", "")).toEqual(
      new DocumentNode([new ParagraphNode([new LinkNode("Hello")])])
    );
  });

  test("Simple link2", () => {
    expect(parse("[[Hello, world!]]", "")).toEqual(
      new DocumentNode([new ParagraphNode([new LinkNode("Hello, world!")])])
    );
  });

  test("Links starting with [[", () => {
    function check(text: string, nodes: Array<AstNode>): void {
      expect(parse(text, "")).toEqual(
        new DocumentNode([new ParagraphNode(nodes)])
      );
    }
    check("[[link", [new TextNode("[[link")]);
    check("[[link]", [new TextNode("[[link]")]);
    check("[[link]]", [new LinkNode("link")]);
    check("[[link]]]", [new LinkNode("link"), new TextNode("]")]);
    check("[[link]]]]", [new LinkNode("link"), new TextNode("]]")]);
    check("[[link]]]]]", [new LinkNode("link"), new TextNode("]]]")]);
  });

  test("Links starting with [[[", () => {
    function check(text: string, nodes: Array<AstNode>): void {
      expect(parse(text, "")).toEqual(
        new DocumentNode([new ParagraphNode(nodes)])
      );
    }
    check("[[[link", [new TextNode("[[[link")]);
    check("[[[link]", [new TextNode("[[[link]")]);
    check("[[[link]]", [new TextNode("[[[link]]")]);
    check("[[[link]]]", [new TextNode("[[[link]]]")]);
    check("[[[link]]]]", [new TextNode("[[[link]]]]")]);
  });

  test("Links starting with [[[[", () => {
    function check(text: string, nodes: Array<AstNode>): void {
      expect(parse(text, "")).toEqual(
        new DocumentNode([new ParagraphNode(nodes)])
      );
    }
    check("[[[[link", [new TextNode("[[[[link")]);
    check("[[[[link]", [new TextNode("[[[[link]")]);
    check("[[[[link]]", [new TextNode("[["), new LinkNode("link")]);
    check("[[[[link]]]", [
      new TextNode("[["),
      new LinkNode("link"),
      new TextNode("]"),
    ]);
    check("[[[[link]]]]", [
      new TextNode("[["),
      new LinkNode("link"),
      new TextNode("]]"),
    ]);
    check("[[[[link]]]]]", [
      new TextNode("[["),
      new LinkNode("link"),
      new TextNode("]]]"),
    ]);
  });

  test("Links starting with even more brackets", () => {
    function check(text: string, nodes: Array<AstNode>): void {
      expect(parse(text, "")).toEqual(
        new DocumentNode([new ParagraphNode(nodes)])
      );
    }
    check("[[[[[link]]", [new TextNode("[[[[[link]]")]);
    check("[[[[[link]]]", [new TextNode("[[[[[link]]]")]);
    check("[[[[[link]]]]", [new TextNode("[[[[[link]]]]")]);
    check("[[[[[[link]]", [new TextNode("[[[["), new LinkNode("link")]);
    check("[[[[[[link]]]", [
      new TextNode("[[[["),
      new LinkNode("link"),
      new TextNode("]"),
    ]);
    check("[[[[[[link]]]]", [
      new TextNode("[[[["),
      new LinkNode("link"),
      new TextNode("]]"),
    ]);
    check("[[[[[[link]]]]]", [
      new TextNode("[[[["),
      new LinkNode("link"),
      new TextNode("]]]"),
    ]);
  });

  test("Link that looks like markup but isn't", () => {
    expect(parse("[[''one'']]", "")).toEqual(
      new DocumentNode([new ParagraphNode([new LinkNode("''one''")])])
    );
  });

  test("Forbidden link characters", () => {
    function check(text: string, nodes: Array<AstNode>): void {
      expect(parse(text, "")).toEqual(
        new DocumentNode([new ParagraphNode(nodes)])
      );
    }
    check("[[link<]]", [new TextNode("[[link<]]")]);
    check("[[link>]]", [new TextNode("[[link>]]")]);
    check("[[with [ bracket]]]", [new TextNode("[[with [ bracket]]]")]);
    check("[[with ] bracket]]", [new TextNode("[[with ] bracket]]")]);
    check("[[with { brace]]", [new TextNode("[[with { brace]]")]);
    check("[[with } brace]]", [new TextNode("[[with } brace]]")]);
    check("[[link\ntwo]]", [new TextNode("[[link two]]")]);
  });

  test("Link with a comment", () => {
    expect(parse("[[this <!-- is | a --> link]]", "")).toEqual(
      new DocumentNode([new ParagraphNode([new LinkNode("this  link")])])
    );
  });

  test("Renamed link", () => {
    expect(parse("[[one|two]]", "")).toEqual(
      new DocumentNode([
        new ParagraphNode([new LinkNode("one", [new TextNode("two")])]),
      ])
    );
  });

  test("Renamed link with formatting", () => {
    expect(parse("[[one|''two'']]", "")).toEqual(
      new DocumentNode([
        new ParagraphNode([
          new LinkNode("one", [new ItalicNode([new TextNode("two")])]),
        ]),
      ])
    );
  });

  test("Renamed link with another link inside", () => {
    expect(parse("[[one|[[two]] three]]", "")).toEqual(
      new DocumentNode([
        new ParagraphNode([
          new TextNode("[[one|"),
          new LinkNode("two"),
          new TextNode(" three]]"),
        ]),
      ])
    );
  });

  test("Renamed link with newlines", () => {
    expect(parse("[[one|two\n==three==\n# four\n]]", "")).toEqual(
      new DocumentNode([
        new ParagraphNode([
          new LinkNode("one", [new TextNode("two ==three== # four ")]),
        ]),
      ])
    );
  });

  test("Renamed link with = character", () => {
    expect(parse("[[one|title=2]]", "")).toEqual(
      new DocumentNode([
        new ParagraphNode([new LinkNode("one", [new TextNode("title=2")])]),
      ])
    );
  });

  test("Renamed link with pipe character", () => {
    expect(parse("[[one|two|three]]", "")).toEqual(
      new DocumentNode([
        new ParagraphNode([new LinkNode("one", [new TextNode("two|three")])]),
      ])
    );
  });

  test("Bleeding links", () => {
    function check(text: string, nodes: Array<AstNode>): void {
      expect(parse(text, "")).toEqual(
        new DocumentNode([new ParagraphNode(nodes)])
      );
    }
    check("[[one]]ness", [new LinkNode("one").addBleedingEnd("ness")]);
    check("[[bus]]es extra", [
      new LinkNode("bus").addBleedingEnd("es"),
      new TextNode(" extra"),
    ]);
    check("[[special]]-ity", [new LinkNode("special"), new TextNode("-ity")]);
  });

  test("Pipe tricks", () => {
    function check(target: string, linkText: string): void {
      expect(parse(`[[${target}|]]`, "")).toEqual(
        new DocumentNode([
          new ParagraphNode([new LinkNode(target, [new TextNode(linkText)])]),
        ])
      );
    }
    check("Pipe (computing)", "Pipe");
    check("Phoenix, Arizona", "Phoenix");
    check("Wikipedia:Verifiability", "Verifiability");
    check("User:Example", "Example");
    check(":Category:Wikipedia", "Wikipedia");
    check("Yours, Mine and Ours (1968 film)", "Yours, Mine and Ours");
    check(":es:Wikipedia:Políticas", "Wikipedia:Políticas");
    check("Il Buono, il Brutto, il Cattivo", "Il Buono");
    check("Wikipedia:Manual of Style (Persian)", "Manual of Style");
  });
});

describe("Templates", () => {
  test("Simple template", () => {
    expect(parse("{{Simple template}}", "")).toEqual(
      new DocumentNode([new ParagraphNode([new TextNode("�")])])
    );
  });
});
