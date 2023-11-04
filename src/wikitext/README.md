# Wikitext

**Wikitext** is the markup language used in Wikipedia and any other MediaWiki-based
wiki. User-oriented description of the language can be found at
[Help:Wikitext](https://en.wikipedia.org/wiki/Help:Wikitext).

The aforementioned description of the language omits the details of a parsing strategy,
and the behavior in some corner cases. We can attempt to reconstruct those details
based on observation (trying various markups in Wikipedia's sandbox).


## Observations

- Certain HTML tags alter the behavior of the parser. These include: `<pre>`,
  `<syntaxhighlight>`, and `<!-- -->`.
  - We will handle these tags at the tokenization stage, making sure that their
    content is parsed in "raw" mode.

- Templates are parsed and replaced with their content before the page is parsed
  normally. This means that the content of a template may theoretically affect
  the parse result, if the content of the template includes special characters
  (including newlines). For example, `== {{uw}} ==\n` will not be parsed as a
  header, because template `{{uw}}` includes newlines; at the same time
  `== {{u|w}} ==\n` will be parsed as a header, because template `{{u|w}}` has
  only one line.
  - We will assume that such pathological use cases do not occur.
  - During parsing, we will detect the templates first, replacing them in the token
    stream with special "template" tokens.

- Various template trivia:
  - A template may contain multiple newlines, without affecting the surrounding block
    structure;
  - For an invalid template, the braces are rendered as plain text;
  - If a template doesn't close before EOF, it is not considered a valid template;
  - An empty template (or containing only whitespace) is not considered valid;
  - The name of a template may contain various special symbols, but not all:
    - allowed: `:`, `;`, `&`, `=`, `!`, `@`, `%`, `^`, `*`, `(`, `)`, `-`, `+`,
      `` ` ``, `~`, `/`, `\`, `'`, `"`, `,`, `.`, `?`;
    - forbidden: `|`, `<`, `>`, `{`, `}`, `[`, `]`;
  - Character `#` is allowed, but all content after this symbol is discarded? It's
    unclear how it works, but there are templates with names like `{{#if:}}`, so
    probably better to treat it as a regular allowed character.
  - An underscore `_` will be replaced with a space when displaying a template's name,
    and spaces will be replaced with an underscore when linking to a template;
  - If the name of a template contains an HTML entity, that entity is replaced with
    its underlying character. If the character is not valid for a template name, the
    template will be invalid.
  - The name of a template may contain another template, in which case the other
    template is transcluded before verifying the validity of the first template's
    name -- probably not going to support this.
  - The name of a template cannot contain a link (including an image).
  - Whitespace at the start/end of a template name is dropped; all other whitespace
    is replaced with a single space.
  - Newlines in a template name are not allowed, unless they are part of the initial/
    trailing whitespace.

- Headers:
  - Whitespace surrounding the equal signs is ignored: `= H =` has text "H".
  - If the equal spans at the start and at the end have different lengths, then
    the shorter one determines the level of the header, and the extra equal signs from
    the other delimiter become part of the header: `== H =` has text "= H".
  - If there is no equals at the end of the line, then this is not a header.
  - Max level of header is 6.
