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
  - A header cannot contain a newline (unless it is a part of a comment, a template,
    or special HTML tag like `<pre>` or `<syntaxhighlight>`)

- Bold/italic:
  - a span of 2 or more `'` characters introduces a bold or italic markup: `''` means
    italic, `'''` means bold. Any "extra" quotes will be left as-is. If the opening
    and closing sequences have different lengths, the shorter one "wins", and the
    longer is left as extra quote marks. If an italic/bold sequence is still open by
    the end of a line, it is auto-closed:
    - `'text` -> `'text`,
    - `'text'` -> `'text'`,
    - `'text''` -> `'text<i></i>`,
    - `'text'''` -> `'text<b></b>`,
    - `'text''''` -> `'text'<b></b>`,
    - `'text'''''` -> `'text ` (can be considered as `<b><i></i></b>`),
    - `'text''''''` -> `'text' `,
    - `'text'''''''` -> `'text'' `,
    - `'text''''''''` -> `'text''' ` etc...,
    - `''text` -> `<i>text</i>`,
    - `''text'` -> `<i>text'</i>`,
    - `''text''` -> `<i>text</i>`,
    - `''text'''` -> `<i>text'</i>`,
    - `''text''''` -> `<i>text''</i>`,
    - `''text'''''` -> `<i>text</i><b></b>`,
    - `''text''''''` -> `<i>text'</i><b></b>`,
    - `''text'''''''` -> `<i>text''</i><b></b>`,
    - `''text''''''''` -> `<i>text'''</i><b></b>` etc...,
    - `'''text` -> `<b>text</b>`,
    - `'''text'` -> `<b>text'</b>`,
    - `'''text''` -> `'<i>text</i>` (note the quote is outside of `<i/>`),
    - `'''text'''` -> `<b>text</b>`,
    - `'''text''''` -> `<b>text'</b>`,
    - `'''text'''''` -> `<b>text</b><i></i>`,
    - `'''text''''''` -> `<b>text'</b><i></i>`,
    - `'''text'''''''` -> `<b>text''</b><i></i>`,
    - `'''text''''''''` -> `<b>text'''</b><i></i>` etc...,
    - `''''text` -> `'<b>text</b>`,
    - `''''text'` -> `'<b>text'</b>`,
    - `''''text''` -> `''<i>text</i>`,
    - `''''text'''` -> `'<b>text</b>`,
    - `''''text''''` -> `'<b>text'</b>`,
    - `''''text'''''` -> `'<b>text</b><i></i>`,
    - `''''text''''''` -> `'<b>text'</b><i></i>`,
    - `''''text'''''''` -> `'<b>text''</b><i></i>`,
    - `''''text''''''''` -> `'<b>text'''</b><i></i>` etc...,
    - `'''''text` -> `<b><i>text</i></b>`,
    - `'''''text'` -> `<b><i>text'</i></b>`,
    - `'''''text''` -> `<b><i>text</i></b>`,
    - `'''''text'''` -> `<i><b>text</b></i>`,
    - `'''''text''''` -> `<i><b>text'</b></i>`,
    - `'''''text'''''` -> `<b><i>text</i></b>`,
    - `'''''text''''''` -> `<b><i>text'</i></b>`,
    - `'''''text'''''''` -> `<b><i>text''</i></b>`,
    - `'''''text''''''''` -> `<b><i>text'''</i></b>` etc...,
    - `''''''text` -> `'<b><i>text</i></b>`,
    - `''''''text'` -> `'<b><i>text'</i></b>`,
    - `''''''text''` -> `'<b><i>text</i></b>`,
    - `''''''text'''` -> `'<i><b>text</b></i>`,
    - `''''''text''''` -> `'<b><i>text'</i></b>`,
    - `''''''text'''''` -> `'<b><i>text</i></b>`,
    - `''''''text''''''` -> `'<b><i>text'</i></b>`,
    - `''''''text'''''''` -> `'<b><i>text''</i></b>`,
    - `''''''text''''''''` -> `'<b><i>text'''</i></b>` etc...,
    - `'''''''text'''''''` -> `''<b><i>text''</i></b>`,
    - `''''''''text''''''''` -> `'''<b><i>text'''</i></b>`, etc.
  - A bold+italic sequence (5 quotes) can be closed in two different places: one time
    as bold, another time as italic:
    - `'''''one'' two''' three` -> `<b><i>one</i> two</b> three`,
    - `'''''one''' two'' three` -> `<i><b>one</b> two</i> three`,
  - Bold and italic sequences can overlap:
    - `''one '''two'' three'''` -> `<i>one <b>two</b></i><b> three</b>`,
    - Note that this is the same behavior as for mismatched tags:
      `<i>one <b>two</i> three</b>` -> `<i>one <b>two</b></i><b> three</b>`;
  - Bold/italic markup inside links does not affect the outside bold/italic:
    - `''one [[NYC|New '''York]] two` -> `<i>one <a>New <b>York</b></a> two</i>`;
  - Bold/italic markup inside tags interacts with the outside:
    - `''one <code>New '''York</code> two` ->
      `<i>one <code>New '</code></i><code>York</code> two`;
  - The template `{{'}}` can be used to insert literal `'` character:
    - `{{'}}{{'}}hello` -> `''hello`

  - Given this observed behavior, the following parsing rules can be surmised:
    - The parser maintains a stack of bold/italic marks that it has seen in a line.
    - When the parser sees a token which is a sequence of single quotes, it treates it
      according to the number `n` of quotes:
      - 1: a simple text quote;
      - 2: an italic delimiter;
      - 3: a bold delimiter;
      - 4: a text quote followed by a bold delimiter;
      - 5: an italic+bold ("strong") delimiter;
      - 6+: a sequence of `n-5` text quotes, followed by a strong delimiter.
    - For each delimiter, we will try to see whether it is an opening or a closing one:
      - italic delimiter is closing if there was a previous italic or strong delimiter
        on the stack. If italic closes a strong delimiter, then the latter is replaced
        with an open bold delimiter.
      - bold delimiter is closing if there was a previous bold/strong delimiter on the
        stack. If bold closes a strong delimiter, the latter is replaced with an italic.
      - strong delimiter is opening if there are no other delimiters on the stack, or
        otherwise it closes the last delimiter and is replaced with the remainder (say,
        if it closed an italic then the remainder is bold, if it closed strong then
        there is no remainder). The remainder delimiter is treated as described above.
    - The stack may have only the following combinations at any time: `[]`, `[bold]`,
      `[italic]`, `[strong]`, `[bold, italic]`, `[italic, bold]`.
    - If at the end of a line the stack has one element, then that element is closed as
      if by a matching delimiter. If the stack has 2 elements (bold+italic or italic+
      bold), then the bold delimiter is replaced with quote+italic, and the italic span
      is created.
