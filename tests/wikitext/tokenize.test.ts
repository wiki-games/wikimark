import { expect, test, describe } from "vitest";
import { tokenize } from "../../src/wikitext/tokenize.js";
import { tokens } from "../../src/wikitext/tokens.js";

describe("Whitespace", () => {
  test("empty", () => {
    expect(tokenize("")).toEqual([]);
  });

  test("spaces", () => {
    expect(tokenize("       ")).toEqual([
      { type: tokens.whitespace, text: "       ", start: [1, 1], end: [1, 8] },
    ]);
  });

  test("tabs", () => {
    expect(tokenize("\t \t")).toEqual([
      { type: tokens.whitespace, text: "        ", start: [1, 1], end: [1, 9] },
    ]);
  });

  test("newlines", () => {
    expect(tokenize("\n\r \n\r\n")).toEqual([
      { type: tokens.newline, text: "\n", start: [1, 1], end: [1, 2] },
      { type: tokens.newline, text: "\n", start: [2, 1], end: [2, 2] },
      { type: tokens.whitespace, text: " ", start: [3, 1], end: [3, 2] },
      { type: tokens.newline, text: "\n", start: [3, 2], end: [3, 3] },
      { type: tokens.newline, text: "\n", start: [4, 1], end: [4, 3] },
    ]);
  });

  test("mix", () => {
    expect(tokenize(" \t\r\n")).toEqual([
      { type: tokens.whitespace, text: "    ", start: [1, 1], end: [1, 5] },
      { type: tokens.newline, text: "\n", start: [1, 5], end: [1, 7] },
    ]);
  });
});

describe("Plain text", () => {
  test("Hello world", () => {
    expect(tokenize("Hello, world!")).toEqual([
      { type: tokens.text, text: "Hello,", start: [1, 1], end: [1, 7] },
      { type: tokens.whitespace, text: " ", start: [1, 7], end: [1, 8] },
      { type: tokens.text, text: "world", start: [1, 8], end: [1, 13] },
      { type: tokens.exclamation, text: "!", start: [1, 13], end: [1, 14] },
    ]);
  });

  test("Unicode", () => {
    expect(tokenize("🎃両")).toEqual([
      { type: tokens.text, text: "🎃両", start: [1, 1], end: [1, 4] },
    ]);
  });

  test("C0 characters", () => {
    expect(tokenize("\x00,\x07,\x1f")).toEqual([
      { type: tokens.text, text: "\ufffd", start: [1, 1], end: [1, 2] },
      { type: tokens.text, text: ",", start: [1, 2], end: [1, 3] },
      { type: tokens.text, text: "\ufffd", start: [1, 3], end: [1, 4] },
      { type: tokens.text, text: ",", start: [1, 4], end: [1, 5] },
      { type: tokens.text, text: "\ufffd", start: [1, 5], end: [1, 6] },
    ]);
  });

  test("C1 characters", () => {
    expect(tokenize("\x7f,\x80,\x9f")).toEqual([
      { type: tokens.text, text: "\ufffd", start: [1, 1], end: [1, 2] },
      { type: tokens.text, text: ",", start: [1, 2], end: [1, 3] },
      { type: tokens.text, text: "\ufffd", start: [1, 3], end: [1, 4] },
      { type: tokens.text, text: ",", start: [1, 4], end: [1, 5] },
      { type: tokens.text, text: "\ufffd", start: [1, 5], end: [1, 6] },
    ]);
  });
});

describe("Html comments", () => {
  test("Simple comment", () => {
    expect(tokenize("<!-- hello -->")).toEqual([
      { type: tokens.commentStart, text: "<!--", start: [1, 1], end: [1, 5] },
      {
        type: tokens.commentBody,
        text: " hello ",
        start: [1, 5],
        end: [1, 12],
      },
      { type: tokens.commentEnd, text: "-->", start: [1, 12], end: [1, 15] },
    ]);
  });

  test("Empty comment", () => {
    expect(tokenize("  <!---->  ")).toEqual([
      { type: tokens.whitespace, text: "  ", start: [1, 1], end: [1, 3] },
      { type: tokens.commentStart, text: "<!--", start: [1, 3], end: [1, 7] },
      { type: tokens.commentEnd, text: "-->", start: [1, 7], end: [1, 10] },
      { type: tokens.whitespace, text: "  ", start: [1, 10], end: [1, 12] },
    ]);
  });

  test("Comment with newlines", () => {
    expect(tokenize("<!--\n==one==\r\n\rtwo-->")).toEqual([
      { type: tokens.commentStart, text: "<!--", start: [1, 1], end: [1, 5] },
      {
        type: tokens.commentBody,
        text: "\n==one==\n\ntwo",
        start: [1, 5],
        end: [4, 4],
      },
      { type: tokens.commentEnd, text: "-->", start: [4, 4], end: [4, 7] },
    ]);
  });

  test("Unclosed comment", () => {
    expect(tokenize("<!-- test\n")).toEqual([
      { type: tokens.commentStart, text: "<!--", start: [1, 1], end: [1, 5] },
      { type: tokens.commentBody, text: " test\n", start: [1, 5], end: [2, 1] },
    ]);
  });

  test("Not a comment", () => {
    expect(tokenize("<!-")).toEqual([
      { type: tokens.leftAngleBracket, text: "<", start: [1, 1], end: [1, 2] },
      { type: tokens.exclamation, text: "!", start: [1, 2], end: [1, 3] },
      { type: tokens.dash, text: "-", start: [1, 3], end: [1, 4] },
    ]);
  });
});

describe("Html entities", () => {
  test("Named entities", () => {
    expect(tokenize("&squo; &lt;&amp;amp;")).toEqual([
      { type: tokens.htmlEntity, text: "&squo;", start: [1, 1], end: [1, 7] },
      { type: tokens.whitespace, text: " ", start: [1, 7], end: [1, 8] },
      { type: tokens.htmlEntity, text: "&lt;", start: [1, 8], end: [1, 12] },
      { type: tokens.htmlEntity, text: "&amp;", start: [1, 12], end: [1, 17] },
      { type: tokens.text, text: "amp", start: [1, 17], end: [1, 20] },
      { type: tokens.semicolon, text: ";", start: [1, 20], end: [1, 21] },
    ]);
  });

  test("Named non-entities", () => {
    expect(tokenize("&hellip&;&123;")).toEqual([
      { type: tokens.ampersand, text: "&", start: [1, 1], end: [1, 2] },
      { type: tokens.text, text: "hellip", start: [1, 2], end: [1, 8] },
      { type: tokens.ampersand, text: "&", start: [1, 8], end: [1, 9] },
      { type: tokens.semicolon, text: ";", start: [1, 9], end: [1, 10] },
      { type: tokens.ampersand, text: "&", start: [1, 10], end: [1, 11] },
      { type: tokens.text, text: "123", start: [1, 11], end: [1, 14] },
      { type: tokens.semicolon, text: ";", start: [1, 14], end: [1, 15] },
    ]);
  });

  test("Decimal entities", () => {
    expect(tokenize("&#159;&#12345;&#0;")).toEqual([
      { type: tokens.htmlEntity, text: "&#159;", start: [1, 1], end: [1, 7] },
      {
        type: tokens.htmlEntity,
        text: "&#12345;",
        start: [1, 7],
        end: [1, 15],
      },
      { type: tokens.htmlEntity, text: "&#0;", start: [1, 15], end: [1, 19] },
    ]);
  });

  test("Decimal non-entities", () => {
    expect(tokenize("&#34&#;&#eq;")).toEqual([
      { type: tokens.ampersand, text: "&", start: [1, 1], end: [1, 2] },
      { type: tokens.hashSign, text: "#", start: [1, 2], end: [1, 3] },
      { type: tokens.text, text: "34", start: [1, 3], end: [1, 5] },
      { type: tokens.ampersand, text: "&", start: [1, 5], end: [1, 6] },
      { type: tokens.hashSign, text: "#", start: [1, 6], end: [1, 7] },
      { type: tokens.semicolon, text: ";", start: [1, 7], end: [1, 8] },
      { type: tokens.ampersand, text: "&", start: [1, 8], end: [1, 9] },
      { type: tokens.hashSign, text: "#", start: [1, 9], end: [1, 10] },
      { type: tokens.text, text: "eq", start: [1, 10], end: [1, 12] },
      { type: tokens.semicolon, text: ";", start: [1, 12], end: [1, 13] },
    ]);
  });

  test("Hexadecimal entities", () => {
    expect(tokenize("&#x02Ff;&#x3a;")).toEqual([
      { type: tokens.htmlEntity, text: "&#x02Ff;", start: [1, 1], end: [1, 9] },
      { type: tokens.htmlEntity, text: "&#x3a;", start: [1, 9], end: [1, 15] },
    ]);
  });

  test("Hexadecimal non-entities", () => {
    expect(tokenize("&#x1ah;&#a&#;")).toEqual([
      { type: tokens.ampersand, text: "&", start: [1, 1], end: [1, 2] },
      { type: tokens.hashSign, text: "#", start: [1, 2], end: [1, 3] },
      { type: tokens.text, text: "x1ah", start: [1, 3], end: [1, 7] },
      { type: tokens.semicolon, text: ";", start: [1, 7], end: [1, 8] },
      { type: tokens.ampersand, text: "&", start: [1, 8], end: [1, 9] },
      { type: tokens.hashSign, text: "#", start: [1, 9], end: [1, 10] },
      { type: tokens.text, text: "a", start: [1, 10], end: [1, 11] },
      { type: tokens.ampersand, text: "&", start: [1, 11], end: [1, 12] },
      { type: tokens.hashSign, text: "#", start: [1, 12], end: [1, 13] },
      { type: tokens.semicolon, text: ";", start: [1, 13], end: [1, 14] },
    ]);
  });
});

describe("Html tags", () => {
  test("Simple tag", () => {
    expect(tokenize("<br>")).toEqual([
      { type: tokens.htmlTagStart, text: "<", start: [1, 1], end: [1, 2] },
      { type: tokens.htmlTagName, text: "br", start: [1, 2], end: [1, 4] },
      { type: tokens.htmlTagEnd, text: ">", start: [1, 4], end: [1, 5] },
    ]);
  });

  test("Closing tag", () => {
    expect(tokenize("</div>")).toEqual([
      { type: tokens.htmlTagStart, text: "</", start: [1, 1], end: [1, 3] },
      { type: tokens.htmlTagName, text: "div", start: [1, 3], end: [1, 6] },
      { type: tokens.htmlTagEnd, text: ">", start: [1, 6], end: [1, 7] },
    ]);
  });

  test("Self-closing tag", () => {
    expect(tokenize("<IMG/>")).toEqual([
      { type: tokens.htmlTagStart, text: "<", start: [1, 1], end: [1, 2] },
      { type: tokens.htmlTagName, text: "IMG", start: [1, 2], end: [1, 5] },
      { type: tokens.htmlTagEnd, text: "/>", start: [1, 5], end: [1, 7] },
    ]);
  });

  test("Invalid tag", () => {
    expect(tokenize("<12>")).toEqual([
      { type: tokens.leftAngleBracket, text: "<", start: [1, 1], end: [1, 2] },
      { type: tokens.text, text: "12", start: [1, 2], end: [1, 4] },
      { type: tokens.rightAngleBracket, text: ">", start: [1, 4], end: [1, 5] },
    ]);
  });

  test("Invalid tag 2", () => {
    expect(tokenize("<[x>")).toEqual([
      { type: tokens.leftAngleBracket, text: "<", start: [1, 1], end: [1, 2] },
      { type: tokens.leftBracketRun, text: "[", start: [1, 2], end: [1, 3] },
      { type: tokens.text, text: "x", start: [1, 3], end: [1, 4] },
      { type: tokens.rightAngleBracket, text: ">", start: [1, 4], end: [1, 5] },
    ]);
  });

  test("Tag with a simple attribute", () => {
    expect(tokenize("<img defer>")).toEqual([
      { type: tokens.htmlTagStart, text: "<", start: [1, 1], end: [1, 2] },
      { type: tokens.htmlTagName, text: "img", start: [1, 2], end: [1, 5] },
      { type: tokens.whitespace, text: " ", start: [1, 5], end: [1, 6] },
      { type: tokens.htmlBareWord, text: "defer", start: [1, 6], end: [1, 11] },
      { type: tokens.htmlTagEnd, text: ">", start: [1, 11], end: [1, 12] },
    ]);
  });

  test("Tag with unquoted attribute", () => {
    expect(tokenize("<div class=test>")).toEqual([
      { type: tokens.htmlTagStart, text: "<", start: [1, 1], end: [1, 2] },
      { type: tokens.htmlTagName, text: "div", start: [1, 2], end: [1, 5] },
      { type: tokens.whitespace, text: " ", start: [1, 5], end: [1, 6] },
      { type: tokens.htmlBareWord, text: "class", start: [1, 6], end: [1, 11] },
      { type: tokens.equal, text: "=", start: [1, 11], end: [1, 12] },
      { type: tokens.htmlBareWord, text: "test", start: [1, 12], end: [1, 16] },
      { type: tokens.htmlTagEnd, text: ">", start: [1, 16], end: [1, 17] },
    ]);
  });

  test("Tag with quoted attribute, single", () => {
    expect(tokenize("<div id\t=\t':>]'>")).toEqual([
      { type: tokens.htmlTagStart, text: "<", start: [1, 1], end: [1, 2] },
      { type: tokens.htmlTagName, text: "div", start: [1, 2], end: [1, 5] },
      { type: tokens.whitespace, text: " ", start: [1, 5], end: [1, 6] },
      { type: tokens.htmlBareWord, text: "id", start: [1, 6], end: [1, 8] },
      { type: tokens.whitespace, text: " ", start: [1, 8], end: [1, 9] },
      { type: tokens.equal, text: "=", start: [1, 9], end: [1, 10] },
      { type: tokens.whitespace, text: "   ", start: [1, 10], end: [1, 13] },
      {
        type: tokens.htmlQuotedString,
        text: "':>]'",
        start: [1, 13],
        end: [1, 18],
      },
      { type: tokens.htmlTagEnd, text: ">", start: [1, 18], end: [1, 19] },
    ]);
  });

  test("Tag with quoted attribute, double", () => {
    expect(tokenize('<code lang="c++">')).toEqual([
      { type: tokens.htmlTagStart, text: "<", start: [1, 1], end: [1, 2] },
      { type: tokens.htmlTagName, text: "code", start: [1, 2], end: [1, 6] },
      { type: tokens.whitespace, text: " ", start: [1, 6], end: [1, 7] },
      { type: tokens.htmlBareWord, text: "lang", start: [1, 7], end: [1, 11] },
      { type: tokens.equal, text: "=", start: [1, 11], end: [1, 12] },
      {
        type: tokens.htmlQuotedString,
        text: '"c++"',
        start: [1, 12],
        end: [1, 17],
      },
      { type: tokens.htmlTagEnd, text: ">", start: [1, 17], end: [1, 18] },
    ]);
  });

  test("Tag with invalid text", () => {
    expect(tokenize("<br $>")).toEqual([
      { type: tokens.htmlTagStart, text: "<", start: [1, 1], end: [1, 2] },
      { type: tokens.htmlTagName, text: "br", start: [1, 2], end: [1, 4] },
      { type: tokens.whitespace, text: " ", start: [1, 4], end: [1, 5] },
      { type: tokens.htmlUnknown, text: "$", start: [1, 5], end: [1, 6] },
      { type: tokens.htmlTagEnd, text: ">", start: [1, 6], end: [1, 7] },
    ]);
  });

  test("Unclosed tag", () => {
    expect(tokenize("<div")).toEqual([
      { type: tokens.htmlTagStart, text: "<", start: [1, 1], end: [1, 2] },
      { type: tokens.htmlTagName, text: "div", start: [1, 2], end: [1, 5] },
    ]);
  });
});

describe("Special HTML tags", () => {
  test("<pre>", () => {
    expect(tokenize("<pre>\none\n{{two}}\n<!--three-->\n</pre>")).toEqual([
      { type: tokens.htmlTagStart, text: "<", start: [1, 1], end: [1, 2] },
      { type: tokens.htmlTagName, text: "pre", start: [1, 2], end: [1, 5] },
      { type: tokens.htmlTagEnd, text: ">", start: [1, 5], end: [1, 6] },
      {
        type: tokens.text,
        text: "\none\n{{two}}\n<!--three-->\n",
        start: [1, 6],
        end: [5, 1],
      },
      { type: tokens.htmlTagStart, text: "</", start: [5, 1], end: [5, 3] },
      { type: tokens.htmlTagName, text: "pre", start: [5, 3], end: [5, 6] },
      { type: tokens.htmlTagEnd, text: ">", start: [5, 6], end: [5, 7] },
    ]);
  });

  test("<syntaxhighlight>", () => {
    expect(
      tokenize(
        "<syntaxhighlight lang=py>\n" + //
          "  </pre>\n" +
          "</syntaxhighlight>"
      )
    ).toEqual([
      { type: tokens.htmlTagStart, text: "<", start: [1, 1], end: [1, 2] },
      {
        type: tokens.htmlTagName,
        text: "syntaxhighlight",
        start: [1, 2],
        end: [1, 17],
      },
      { type: tokens.whitespace, text: " ", start: [1, 17], end: [1, 18] },
      { type: tokens.htmlBareWord, text: "lang", start: [1, 18], end: [1, 22] },
      { type: tokens.equal, text: "=", start: [1, 22], end: [1, 23] },
      { type: tokens.htmlBareWord, text: "py", start: [1, 23], end: [1, 25] },
      { type: tokens.htmlTagEnd, text: ">", start: [1, 25], end: [1, 26] },
      { type: tokens.text, text: "\n  ", start: [1, 26], end: [2, 3] },
      { type: tokens.leftAngleBracket, text: "<", start: [2, 3], end: [2, 4] },
      { type: tokens.text, text: "/pre>\n", start: [2, 4], end: [3, 1] },
      { type: tokens.htmlTagStart, text: "</", start: [3, 1], end: [3, 3] },
      {
        type: tokens.htmlTagName,
        text: "syntaxhighlight",
        start: [3, 3],
        end: [3, 18],
      },
      { type: tokens.htmlTagEnd, text: ">", start: [3, 18], end: [3, 19] },
    ]);
  });
});

describe("Templates", () => {
  test("Simple template", () => {
    expect(tokenize("{{Simple}}")).toEqual([
      { type: tokens.leftBraceRun, text: "{{", start: [1, 1], end: [1, 3] },
      { type: tokens.text, text: "Simple", start: [1, 3], end: [1, 9] },
      { type: tokens.rightBraceRun, text: "}}", start: [1, 9], end: [1, 11] },
    ]);
  });

  test("Template with args", () => {
    expect(tokenize("{{Temp|| arg  = value}}")).toEqual([
      { type: tokens.leftBraceRun, text: "{{", start: [1, 1], end: [1, 3] },
      { type: tokens.text, text: "Temp", start: [1, 3], end: [1, 7] },
      { type: tokens.pipe, text: "|", start: [1, 7], end: [1, 8] },
      { type: tokens.pipe, text: "|", start: [1, 8], end: [1, 9] },
      { type: tokens.whitespace, text: " ", start: [1, 9], end: [1, 10] },
      { type: tokens.text, text: "arg", start: [1, 10], end: [1, 13] },
      { type: tokens.whitespace, text: "  ", start: [1, 13], end: [1, 15] },
      { type: tokens.equalSignsRun, text: "=", start: [1, 15], end: [1, 16] },
      { type: tokens.whitespace, text: " ", start: [1, 16], end: [1, 17] },
      { type: tokens.text, text: "value", start: [1, 17], end: [1, 22] },
      { type: tokens.rightBraceRun, text: "}}", start: [1, 22], end: [1, 24] },
    ]);
  });

  test("Adjacent templates", () => {
    expect(tokenize("{{first}}{{second}}")).toEqual([
      { type: tokens.leftBraceRun, text: "{{", start: [1, 1], end: [1, 3] },
      { type: tokens.text, text: "first", start: [1, 3], end: [1, 8] },
      { type: tokens.rightBraceRun, text: "}}", start: [1, 8], end: [1, 10] },
      { type: tokens.leftBraceRun, text: "{{", start: [1, 10], end: [1, 12] },
      { type: tokens.text, text: "second", start: [1, 12], end: [1, 18] },
      { type: tokens.rightBraceRun, text: "}}", start: [1, 18], end: [1, 20] },
    ]);
  });
});

describe("Miscellaneous", () => {
  test("Hyphens", () => {
    expect(tokenize("------")).toEqual([
      { type: tokens.dash, text: "------", start: [1, 1], end: [1, 7] },
    ]);
  });
});
