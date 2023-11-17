import { expect, test, describe } from "vitest";
import { parse } from "../../src/wikitext/parse.js";
import {
  AstNode,
  BoldNode,
  CodeBlockNode,
  DocumentNode,
  HeaderNode,
  HtmlElementNode,
  ImageNode,
  ItalicNode,
  LinkNode,
  ListItemNode,
  OrderedListNode,
  ParagraphNode,
  SubscriptNode,
  SuperscriptNode,
  TemplateArgNode,
  TemplateNode,
  TextNode,
  ThematicBreakNode,
  UnorderedListNode,
} from "../../src/nodes.js";

test("Empty document", () => {
  expect(parse("", "")).toEqual(new DocumentNode());
  expect(parse("  \t  ", "")).toEqual(new DocumentNode());
  expect(parse("\n\r\n\r  \r", "")).toEqual(new DocumentNode());
});

describe("Paragraphs", () => {
  test("Simple text", () => {
    expect(parse("Simple text", "")).toEqual(
      SingleParagraph(Text("Simple text"))
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
      SingleParagraph(
        "This paragraph contains multiple lines even if it's just  one sentence."
      )
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
        Paragraph("Paragraph one."),
        Paragraph("Another paragraph that may span several lines."),
        Paragraph("Third paragraph, just for fun."),
      ])
    );
  });

  test("Paragraph with a comment", () => {
    expect(parse("Para <!-- 1\n\n2\n\n  --> one", "")).toEqual(
      SingleParagraph("Para  one")
    );
  });
});

describe("Headers", () => {
  test("Simple header", () => {
    expect(parse("=Simple=", "")).toEqual(SingleHeader(1, "Simple"));
  });

  test("Not a header", () => {
    expect(parse("==\n", "")).toEqual(SingleParagraph("=="));
  });

  test("Not a header again", () => {
    expect(parse("=== Looks like a header", "")).toEqual(
      SingleParagraph("=== Looks like a header")
    );
  });

  test("Header with whitespace", () => {
    expect(parse("==  Header two ==", "")).toEqual(
      SingleHeader(2, "Header two")
    );
  });

  test("Mismatched header, left", () => {
    expect(parse("=== Another header =", "")).toEqual(
      SingleHeader(1, "== Another header")
    );
  });

  test("Mismatched header, right", () => {
    expect(parse("=  Another header ====", "")).toEqual(
      SingleHeader(1, "Another header ===")
    );
  });

  test("Header terminates a paragraph", () => {
    expect(parse("Hello,\n==world==\n!", "")).toEqual(
      new DocumentNode([
        Paragraph("Hello,"),
        Header(2, "world"),
        Paragraph("!"),
      ])
    );
  });

  test("Consecutive headers", () => {
    expect(parse("==H1==\n==H2==\n==H3==\n", "")).toEqual(
      new DocumentNode([Header(2, "H1"), Header(2, "H2"), Header(2, "H3")])
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
        Header(1, "H1"),
        Header(2, "H2"),
        Header(3, "H3"),
        Header(4, "H4"),
        Header(5, "H5"),
        Header(6, "H6"),
      ])
    );
  });

  test("Header is not too long", () => {
    expect(parse("==========H2==\n==H2==========", "")).toEqual(
      new DocumentNode([Header(2, "========H2"), Header(2, "H2========")])
    );
  });

  test("Header is too long but still ok", () => {
    expect(parse("========== H6 ==========", "")).toEqual(
      SingleHeader(6, "==== H6 ====")
    );
  });

  test("Header with a comment", () => {
    expect(parse("== Header<!--\n\n\n--> one==", "")).toEqual(
      SingleHeader(2, "Header one")
    );
  });

  test("Header with <pre>", () => {
    expect(parse("== Header <pre>\nhohoho\n</pre> ==", "")).toEqual(
      SingleHeader(2, [Text("Header "), new CodeBlockNode("\nhohoho\n")])
    );
  });
});

describe("Bold/italic", () => {
  function check(text: string, nodes: Array<AstNode> | AstNode | string) {
    expect(parse(text, "")).toEqual(SingleParagraph(nodes));
  }

  test("Starts with 1 quote", () => {
    check("'text", [Text("'text")]);
    check("'text'", [Text("'text'")]);
    check("'text''", [Text("'text"), Italic()]);
    check("'text'''", [Text("'text"), Bold()]);
    check("'text''''", [Text("'text'"), Bold()]);
    check("'text'''''", [Text("'text"), Bold(Italic())]);
    check("'text''''''", [Text("'text'"), Bold(Italic())]);
    check("'text'''''''", [Text("'text''"), Bold(Italic())]);
    check("'text''''''''", [Text("'text'''"), Bold(Italic())]);
  });

  test("Starts with 2 quotes", () => {
    check("''text", [Italic("text")]);
    check("''text'", [Italic("text'")]);
    check("''text''", [Italic("text")]);
    check("''text'''", [Italic("text'")]);
    check("''text''''", [Italic("text''")]);
    check("''text'''''", [Italic("text"), Bold()]);
    check("''text''''''", [Italic("text'"), Bold()]);
    check("''text'''''''", [Italic("text''"), Bold()]);
    check("''text''''''''", [Italic("text'''"), Bold()]);
  });

  test("Starts with 3 quotes", () => {
    check("'''text", [Bold("text")]);
    check("'''text'", [Bold("text'")]);
    check("'''text''", [Text("'"), Italic("text")]);
    check("'''text'''", [Bold("text")]);
    check("'''text''''", [Bold("text'")]);
    check("'''text'''''", [Bold("text"), Italic()]);
    check("'''text''''''", [Bold("text'"), Italic()]);
    check("'''text'''''''", [Bold("text''"), Italic()]);
    check("'''text''''''''", [Bold("text'''"), Italic()]);
  });

  test("Starts with 4 quotes", () => {
    check("''''text", [Text("'"), Bold("text")]);
    check("''''text'", [Text("'"), Bold("text'")]);
    check("''''text''", [Text("''"), Italic("text")]);
    check("''''text'''", [Text("'"), Bold("text")]);
    check("''''text''''", [Text("'"), Bold("text'")]);
    check("''''text'''''", [Text("'"), Bold("text"), Italic()]);
    check("''''text''''''", [Text("'"), Bold("text'"), Italic()]);
    check("''''text'''''''", [Text("'"), Bold("text''"), Italic()]);
    check("''''text''''''''", [Text("'"), Bold("text'''"), Italic()]);
  });

  test("Starts with 5 quotes", () => {
    check("'''''text", [Bold(Italic("text"))]);
    check("'''''text'", [Bold(Italic("text'"))]);
    check("'''''text''", [Bold(Italic("text"))]);
    check("'''''text'''", [Italic(Bold("text"))]);
    check("'''''text''''", [Italic(Bold("text'"))]);
    check("'''''text'''''", [Bold(Italic("text"))]);
    check("'''''text''''''", [Bold(Italic("text'"))]);
    check("'''''text'''''''", [Bold(Italic("text''"))]);
    check("'''''text''''''''", [Bold(Italic("text'''"))]);
  });

  test("Starts with 6 quotes", () => {
    check("''''''text", [Text("'"), Bold(Italic("text"))]);
    check("''''''text'", [Text("'"), Bold(Italic("text'"))]);
    check("''''''text''", [Text("'"), Bold(Italic("text"))]);
    check("''''''text'''", [Text("'"), Italic(Bold("text"))]);
    check("''''''text''''", [Text("'"), Italic(Bold("text'"))]);
    check("''''''text'''''", [Text("'"), Bold(Italic("text"))]);
    check("''''''text''''''", [Text("'"), Bold(Italic("text'"))]);
    check("''''''text'''''''", [Text("'"), Bold(Italic("text''"))]);
    check("''''''text''''''''", [Text("'"), Bold(Italic("text'''"))]);
  });

  test("Starts with even more quotes", () => {
    check("'''''''text'''''''", [Text("''"), Bold(Italic("text''"))]);
    check("''''''''text''''''''", [Text("'''"), Bold(Italic("text'''"))]);
  });

  test("Bold+italic closes in separate places", () => {
    check("'''''one'' two''' three", [
      Bold([Italic("one"), Text(" two")]),
      Text(" three"),
    ]);
    check("'''''one''' two'' three", [
      Italic([Bold("one"), Text(" two")]),
      Text(" three"),
    ]);
  });

  test("Overlapping bold/italic ranges", () => {
    check("''one '''two'' three'''", [
      Italic([Text("one "), Bold("two")]),
      Bold(" three"),
    ]);
  });

  test("Unclosed bold and italic ranges", () => {
    check("'''one ''two'''", [Bold([Text("one "), Italic("two")]), Italic()]);
    check("''one '''two''", [Italic([Text("one "), Bold("two")]), Bold()]);
  });

  test("Separate bold and italic closed with '''''", () => {
    check("''one '''two''''' three", [
      Italic([Text("one "), Bold("two")]),
      Text(" three"),
    ]);
    check("'''one ''two''''' three", [
      Bold([Text("one "), Italic("two")]),
      Text(" three"),
    ]);
  });
});

describe("Links", () => {
  test("Simple link", () => {
    expect(parse("[[Hello]]", "")).toEqual(SingleParagraph(Link("Hello")));
  });

  test("Simple link2", () => {
    expect(parse("[[Hello, world!]]", "")).toEqual(
      SingleParagraph(Link("Hello, world!"))
    );
  });

  test("Links starting with [[", () => {
    function check(text: string, nodes: Array<AstNode>): void {
      expect(parse(text, "")).toEqual(SingleParagraph(nodes));
    }
    check("[[link", [Text("[[link")]);
    check("[[link]", [Text("[[link]")]);
    check("[[link]]", [Link("link")]);
    check("[[link]]]", [Link("link"), Text("]")]);
    check("[[link]]]]", [Link("link"), Text("]]")]);
    check("[[link]]]]]", [Link("link"), Text("]]]")]);
  });

  test("Links starting with [[[", () => {
    function check(text: string, nodes: Array<AstNode>): void {
      expect(parse(text, "")).toEqual(SingleParagraph(nodes));
    }
    check("[[[link", [Text("[[[link")]);
    check("[[[link]", [Text("[[[link]")]);
    check("[[[link]]", [Text("[[[link]]")]);
    check("[[[link]]]", [Text("[[[link]]]")]);
    check("[[[link]]]]", [Text("[[[link]]]]")]);
  });

  test("Links starting with [[[[", () => {
    function check(text: string, nodes: Array<AstNode>): void {
      expect(parse(text, "")).toEqual(SingleParagraph(nodes));
    }
    check("[[[[link", [Text("[[[[link")]);
    check("[[[[link]", [Text("[[[[link]")]);
    check("[[[[link]]", [Text("[["), Link("link")]);
    check("[[[[link]]]", [Text("[["), Link("link"), Text("]")]);
    check("[[[[link]]]]", [Text("[["), Link("link"), Text("]]")]);
    check("[[[[link]]]]]", [Text("[["), Link("link"), Text("]]]")]);
  });

  test("Links starting with even more brackets", () => {
    function check(text: string, nodes: Array<AstNode>): void {
      expect(parse(text, "")).toEqual(SingleParagraph(nodes));
    }
    check("[[[[[link]]", [Text("[[[[[link]]")]);
    check("[[[[[link]]]", [Text("[[[[[link]]]")]);
    check("[[[[[link]]]]", [Text("[[[[[link]]]]")]);
    check("[[[[[[link]]", [Text("[[[["), Link("link")]);
    check("[[[[[[link]]]", [Text("[[[["), Link("link"), Text("]")]);
    check("[[[[[[link]]]]", [Text("[[[["), Link("link"), Text("]]")]);
    check("[[[[[[link]]]]]", [Text("[[[["), Link("link"), Text("]]]")]);
  });

  test("Link that looks like markup but isn't", () => {
    expect(parse("[[''one'']]", "")).toEqual(SingleParagraph(Link("''one''")));
  });

  test("Forbidden link characters", () => {
    function check(text: string, nodes: Array<AstNode>): void {
      expect(parse(text, "")).toEqual(SingleParagraph(nodes));
    }
    check("[[link<]]", [Text("[[link<]]")]);
    check("[[link>]]", [Text("[[link>]]")]);
    check("[[with [ bracket]]]", [Text("[[with [ bracket]]]")]);
    check("[[with ] bracket]]", [Text("[[with ] bracket]]")]);
    check("[[with { brace]]", [Text("[[with { brace]]")]);
    check("[[with } brace]]", [Text("[[with } brace]]")]);
    check("[[link\ntwo]]", [Text("[[link two]]")]);
  });

  test("Link with a comment", () => {
    expect(parse("[[this <!-- is | a --> link]]", "")).toEqual(
      SingleParagraph(Link("this  link"))
    );
  });

  test("Renamed link", () => {
    expect(parse("[[one|two]]", "")).toEqual(
      SingleParagraph(Link("one", [Text("two")]))
    );
  });

  test("Renamed link with formatting", () => {
    expect(parse("[[one|''two'']]", "")).toEqual(
      SingleParagraph(Link("one", [Italic("two")]))
    );
  });

  test("Renamed link with another link inside", () => {
    expect(parse("[[one|[[two]] three]]", "")).toEqual(
      SingleParagraph([Text("[[one|"), Link("two"), Text(" three]]")])
    );
  });

  test("Renamed link with newlines", () => {
    expect(parse("[[one|two\n==three==\n# four\n]]", "")).toEqual(
      SingleParagraph(Link("one", [Text("two ==three== # four ")]))
    );
  });

  test("Renamed link with = character", () => {
    expect(parse("[[one|title=2]]", "")).toEqual(
      SingleParagraph(Link("one", [Text("title=2")]))
    );
  });

  test("Renamed link with pipe character", () => {
    expect(parse("[[one|two|three]]", "")).toEqual(
      SingleParagraph(Link("one", [Text("two|three")]))
    );
  });

  test("Bleeding links", () => {
    function check(text: string, nodes: Array<AstNode>): void {
      expect(parse(text, "")).toEqual(SingleParagraph(nodes));
    }
    check("[[one]]ness", [Link("one").addBleedingEnd("ness")]);
    check("[[bus]]es extra", [
      Link("bus").addBleedingEnd("es"),
      Text(" extra"),
    ]);
    check("[[special]]-ity", [Link("special"), Text("-ity")]);
  });

  test("Pipe tricks", () => {
    function check(target: string, linkText: string): void {
      expect(parse(`[[${target}|]]`, "")).toEqual(
        SingleParagraph(Link(target, [Text(linkText)]))
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

describe("Ordered/unordered lists", () => {
  test("Single list item", () => {
    expect(parse("*item", "")).toEqual(SingleUL([LI("item")]));
  });

  test("Multiple list items", () => {
    expect(parse("* item 1\n* item 2\n* item 3\n", "")).toEqual(
      SingleUL([LI("item 1"), LI("item 2"), LI("item 3")])
    );
  });

  test("Empty list item", () => {
    expect(parse("* \t", "")).toEqual(SingleUL([LI()]));
    expect(parse("#", "")).toEqual(SingleOL([LI()]));
  });

  test("Deep list item", () => {
    expect(parse("*** Deep", "")).toEqual(
      SingleUL([LI([UL([LI([UL([LI("Deep")])])])])])
    );
  });

  test("Ordered list", () => {
    expect(parse("# one\n# two\n#three", "")).toEqual(
      SingleOL([LI("one"), LI("two"), LI("three")])
    );
  });

  test("Complicated mixed list", () => {
    expect(
      parse(
        "* once\n" +
          "* upon\n" +
          "** a\n" +
          "** time\n" +
          "**# there\n" +
          "*# lived\n" +
          "*### a\n",
        ""
      )
    ).toEqual(
      SingleUL([
        LI("once"),
        LI([
          Text("upon"),
          UL([LI("a"), LI([Text("time"), OL([LI("there")])])]),
          OL([LI([Text("lived"), OL([LI([OL([LI("a")])])])])]),
        ]),
      ])
    );
  });

  test("List interrupts a paragraph", () => {
    expect(parse("paragraph 1\n* list\nparagraph 2", "")).toEqual(
      new DocumentNode([
        Paragraph("paragraph 1"),
        UL([LI("list")]),
        Paragraph("paragraph 2"),
      ])
    );
  });
});

describe("Templates", () => {
  test("Simple template", () => {
    expect(parse("{{Simple template}}", "")).toEqual(
      SingleParagraph(Template("Simple template"))
    );
  });

  test("Template with an argument", () => {
    expect(parse("{{one|two}}", "")).toEqual(
      SingleParagraph(Template("one", [Arg(null, Text("two"))]))
    );
  });

  test("Template with a named argument", () => {
    expect(parse("{{one|two=three}}", "")).toEqual(
      SingleParagraph(Template("one", [Arg("two", Text("three"))]))
    );
  });

  test("Multi-line template", () => {
    expect(
      parse("{{Template|\n  arg1 = value1\n | arg2\n =  value2\n}}", "")
    ).toEqual(
      SingleParagraph(
        Template("Template", [
          Arg("arg1", Text("value1")),
          Arg("arg2", Text("value2")),
        ])
      )
    );
  });

  test("Unclosed template", () => {
    expect(parse("{{templ", "")).toEqual(SingleParagraph("{{templ"));
    expect(parse("{{templ|", "")).toEqual(SingleParagraph("{{templ|"));
    expect(parse("{{templ}", "")).toEqual(SingleParagraph("{{templ}"));
    expect(parse("{{templ|}", "")).toEqual(SingleParagraph("{{templ|}"));
    expect(parse("{{templ|arg}", "")).toEqual(SingleParagraph("{{templ|arg}"));
  });

  test("Template with newline in the name", () => {
    expect(parse("{{abc\ndef}}", "")).toEqual(SingleParagraph("{{abc def}}"));
    expect(parse("{{abc\n}}", "")).toEqual(SingleParagraph(Template("abc")));
  });

  test("Template with comment in the name or arg", () => {
    expect(parse("{{abc<!--\n-->def}}", "")).toEqual(
      SingleParagraph(Template("abcdef"))
    );
    expect(parse("{{abc|d<!--\n-->ef=}}", "")).toEqual(
      SingleParagraph(Template("abc", [Arg("def", [])]))
    );
  });

  test("Invalid characters in template name", () => {
    expect(parse("{{abc[def}}", "")).toEqual(SingleParagraph("{{abc[def}}"));
    expect(parse("{{abc]def}}", "")).toEqual(SingleParagraph("{{abc]def}}"));
    expect(parse("{{abc<def}}", "")).toEqual(SingleParagraph("{{abc<def}}"));
    expect(parse("{{abc>def}}", "")).toEqual(SingleParagraph("{{abc>def}}"));
    expect(parse("{{abc{def}}", "")).toEqual(SingleParagraph("{{abc{def}}"));
    expect(parse("{{abc}def}}", "")).toEqual(SingleParagraph("{{abc}def}}"));
  });

  test("Template inside template", () => {
    expect(parse("{{abc|{{def}} }}", "")).toEqual(
      SingleParagraph(
        Template("abc", [Arg(null, [Template("def"), Text(" ")])])
      )
    );
  });
});

describe("Images", () => {
  test("Simple image", () => {
    expect(parse("[[File:logo.svg]]")).toEqual(
      SingleParagraph(Image("logo.svg"))
    );
    expect(parse("[[Image:new logo.png]]")).toEqual(
      SingleParagraph(Image("new logo.png"))
    );
  });

  test("Image with caption", () => {
    expect(parse("[[File:wiki.png|thumb|Wikipedia logo]]")).toEqual(
      SingleParagraph(
        Image("wiki.png", { Type: "thumb" }, [Text("Wikipedia logo")])
      )
    );
  });

  test("Image with alt text", () => {
    expect(parse("[[File:wiki.png|alt=Puzzle ''globe'' logo]]")).toEqual(
      SingleParagraph(Image("wiki.png", { Alt: "Puzzle globe logo" }))
    );
  });

  test("Image with link", () => {
    expect(parse("[[File:wiki.png|link=Wikipedia]]")).toEqual(
      SingleParagraph(Image("wiki.png", { Link: "Wikipedia" }))
    );
  });

  test("Various properties", () => {
    expect(
      parse("[[File:wiki.png|frame|centre|alt=Puzzle globe|Wikipedia logo]]")
    ).toEqual(
      SingleParagraph(
        Image(
          "wiki.png",
          { Type: "frame", HAlign: "center", Alt: "Puzzle globe" },
          [Text("Wikipedia logo")]
        )
      )
    );
  });

  test("Various properties 2", () => {
    expect(parse("[[File:wiki.png|thumb|left|50 px|Wikipedia logo]]")).toEqual(
      SingleParagraph(
        Image("wiki.png", { Type: "thumb", HAlign: "left", Size: "width=50" }, [
          Text("Wikipedia logo"),
        ])
      )
    );
  });

  test("Image with fixed height", () => {
    expect(parse("[[File:image.png|x 32px|Some image]]")).toEqual(
      SingleParagraph(
        Image("image.png", { Size: "height=32" }, [Text("Some image")])
      )
    );
  });

  test("Image with max width+height", () => {
    expect(parse("[[File:image.png|x 22x32 px|Some image]]")).toEqual(
      SingleParagraph(
        Image("image.png", { Size: "fit=22x32" }, [Text("Some image")])
      )
    );
  });
});

describe("Thematic break", () => {
  test("Simple case", () => {
    expect(parse("----")).toEqual(new DocumentNode([new ThematicBreakNode()]));
  });

  test("With extra whitespace", () => {
    expect(parse("------ ")).toEqual(
      new DocumentNode([new ThematicBreakNode()])
    );
  });

  test("Not a break", () => {
    expect(parse("---")).toEqual(SingleParagraph("---"));
    expect(parse("-- -- --")).toEqual(SingleParagraph("-- -- --"));
    expect(parse("- - - -")).toEqual(SingleParagraph("- - - -"));
  });

  test("With a comment", () => {
    expect(parse("---- <!-- ha -->\n")).toEqual(
      new DocumentNode([new ThematicBreakNode()])
    );
  });

  test("Break within a paragraph", () => {
    expect(parse("Hello,\n-----\nworld!\n")).toEqual(
      new DocumentNode([
        Paragraph("Hello,"),
        new ThematicBreakNode(),
        Paragraph("world!"),
      ])
    );
  });
});

describe("Html Tags", () => {
  test("Simple tag", () => {
    expect(parse("<span>Hello</span>, world")).toEqual(
      SingleParagraph([HTML("span", {}, [Text("Hello")]), Text(", world")])
    );
  });

  test("<hr>", () => {
    expect(parse("<hr>then</hr>")).toEqual(
      SingleParagraph([new ThematicBreakNode(), Text("then")])
    );
  });

  test("<h1> ... <h6>", () => {
    expect(parse("<h1>one</h1>")).toEqual(SingleParagraph(Header(1, "one")));
    expect(parse("<h2>two</h2>")).toEqual(SingleParagraph(Header(2, "two")));
    expect(parse("<h3>tri</h3>")).toEqual(SingleParagraph(Header(3, "tri")));
    expect(parse("<h4>four</h4>")).toEqual(SingleParagraph(Header(4, "four")));
    expect(parse("<h5>five</h5>")).toEqual(SingleParagraph(Header(5, "five")));
    expect(parse("<h6>six</h6>")).toEqual(SingleParagraph(Header(6, "six")));
  });

  test("<i>/<b>", () => {
    expect(parse("<i>one</i>")).toEqual(SingleParagraph(Italic("one")));
    expect(parse("<em>one</em>")).toEqual(SingleParagraph(Italic("one")));
    expect(parse("<b>one</b>")).toEqual(SingleParagraph(Bold("one")));
    expect(parse("<strong>one</strong>")).toEqual(SingleParagraph(Bold("one")));
  });

  test("<sup>/<sub>", () => {
    expect(parse("<sub>one</sub>")).toEqual(
      SingleParagraph(new SubscriptNode([Text("one")]))
    );
    expect(parse("<sup>one</sup>")).toEqual(
      SingleParagraph(new SuperscriptNode([Text("one")]))
    );
  });

  test("Tag with attributes", () => {
    expect(parse('<mark style="background:yellow;">HyperText</mark>')).toEqual(
      SingleParagraph(
        HTML("mark", { style: "background:yellow;" }, [Text("HyperText")])
      )
    );
  });

  test("<syntaxhighlight>", () => {
    expect(
      parse(
        "<syntaxhighlight lang = cpp>\n" +
          'std::cout << "Hello, world!" << std::endl;\n' +
          "</syntaxhighlight>"
      )
    ).toEqual(
      SingleParagraph(
        new CodeBlockNode(
          '\nstd::cout << "Hello, world!" << std::endl;\n',
          "cpp"
        )
      )
    );
  });

  test("Nested tags", () => {
    expect(parse("<b>alpha, <i>beta</i>, gamma</b>, delta")).toEqual(
      SingleParagraph([
        Bold([Text("alpha, "), Italic("beta"), Text(", gamma")]),
        Text(", delta"),
      ])
    );
  });

  test("Unclosed tags", () => {
    expect(parse("Alpha, <b>beta, <i>bravo\n\nCharlie</i>")).toEqual(
      new DocumentNode([
        Paragraph([Text("Alpha, "), Bold([Text("beta, "), Italic("bravo")])]),
        Paragraph([Text("Charlie")]),
      ])
    );
  });
});

//--------------------------------------------------------------------------------------
// Helper functions
//--------------------------------------------------------------------------------------

function SingleParagraph(
  nodes: string | AstNode | Array<AstNode>
): DocumentNode {
  return new DocumentNode([Paragraph(nodes)]);
}

function SingleHeader(
  level: number,
  nodes: string | AstNode | Array<AstNode>
): DocumentNode {
  return new DocumentNode([Header(level, nodes)]);
}

function SingleUL(nodes: Array<AstNode>): DocumentNode {
  return new DocumentNode([new UnorderedListNode(true, nodes)]);
}

function SingleOL(nodes: Array<AstNode>): DocumentNode {
  return new DocumentNode([new OrderedListNode(true, nodes)]);
}

function UL(nodes: Array<ListItemNode>): UnorderedListNode {
  return new UnorderedListNode(true, nodes);
}

function OL(nodes: Array<ListItemNode>): OrderedListNode {
  return new OrderedListNode(true, nodes);
}

function Paragraph(nodes: string | AstNode | Array<AstNode>): ParagraphNode {
  if (nodes instanceof AstNode) nodes = [nodes];
  if (typeof nodes === "string") nodes = [new TextNode(nodes)];
  return new ParagraphNode(nodes);
}

function Header(
  level: number,
  nodes: string | AstNode | Array<AstNode>
): HeaderNode {
  if (nodes instanceof AstNode) nodes = [nodes];
  if (typeof nodes === "string") nodes = [new TextNode(nodes)];
  return new HeaderNode(level, nodes);
}

function Text(text: string): TextNode {
  return new TextNode(text);
}

function Bold(
  nodes: null | string | AstNode | Array<AstNode> = null
): BoldNode {
  if (nodes === null) nodes = [];
  if (nodes instanceof AstNode) nodes = [nodes];
  if (!(nodes instanceof Array)) nodes = [new TextNode(nodes)];
  return new BoldNode(nodes);
}

function Italic(
  nodes: null | string | AstNode | Array<AstNode> = null
): ItalicNode {
  if (nodes === null) nodes = [];
  if (nodes instanceof AstNode) nodes = [nodes];
  if (!(nodes instanceof Array)) nodes = [new TextNode(nodes)];
  return new ItalicNode(nodes);
}

function Link(target: string, nodes: Array<AstNode> | null = null): LinkNode {
  if (nodes === null) nodes = [];
  return new LinkNode(target, nodes);
}

function Image(
  target: string,
  properties?: { [key: string]: string },
  children?: Array<AstNode>
): ImageNode {
  return new ImageNode(target, properties, children);
}

function LI(
  nodes: string | AstNode | Array<AstNode> | null = null
): ListItemNode {
  if (nodes === null) nodes = [];
  if (nodes instanceof AstNode) nodes = [nodes];
  if (typeof nodes === "string") nodes = [Text(nodes)];
  return new ListItemNode(nodes);
}

function Template(name: string, args?: Array<TemplateArgNode>): TemplateNode {
  return new TemplateNode(name, args);
}

function Arg(
  name: string | null,
  nodes: Array<AstNode> | AstNode
): TemplateArgNode {
  if (nodes instanceof AstNode) nodes = [nodes];
  return new TemplateArgNode(name, nodes);
}

function HTML(
  tag: string,
  attrs?: { [key: string]: string },
  children?: Array<AstNode>
): AstNode {
  return new HtmlElementNode(tag, attrs, children);
}
