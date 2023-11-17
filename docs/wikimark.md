# Wikimark

The **Wikimark** language is designed for authoring wiki content. It is an evolution of
the [Wikitext] that powers Wikipedia, and [Markdown][Commonmark], which is the lingua
franca for writing documentation. Many of Wikimark's features were further inspired by
[Djot], a popular Markdown's successor.

[Wikitext]: https://en.wikipedia.org/wiki/Help:Wikitext
[Commonmark]: https://spec.commonmark.org/0.30/
[Djot]: https://htmlpreview.github.io/?https://github.com/jgm/djot/blob/master/doc/syntax.html


## General principles

The design of Wikimark is centered around the following principles:

1. The syntax should be easy to read. This includes avoiding unnecessary punctuation,
   and prohibiting constructs whose meaning may be ambiguous, or appearance ugly.

2. Block elements should appear "blockly", that is, it should be possible to visually
   draw a box around any block element.

3. The syntax should be composable: the formatting of an element should not depend on
   whether it is nested inside other elements or not.

4. The syntax should allow for arbitrary extensions, a-la templates in Wikitext.

**NOTE**: Unlike in Wikitext or Markdown, the Wikimark recognizes certain inputs as
invalid. If a parser encounters such a document in practice, it is free to deal with
the situation in any way it wants. The behavior of the standard Wikimark parser in
these cases should not be considered canonical, and in fact may change at any time.


### Parsing strategy

Just like any other text editing program, Wikimark distinguishes between "block" and
"inline" content. The "inline" category includes anything that decorates the text, or
can be inserted directly into text: various text styles, embellishments, emojis, etc.
On the contrary, the "block" content is anything that can be confined to a box, either
explicit or implicit: a paragraph, an infobox, a list item, etc.

In Wikimark, all block syntaxes can be discerned by looking at the start of each line.
For example, a header starts with one or more `#` signs followed by a space. Further,
each block syntax specifies a *continuation rule*: what the next line should start with
in order for it to be considered a part of the same block.

Once all lines that belong to a block have been parsed, the prefixes that identified
those lines are stripped, and the remaining lines are processed according to the rules
of that particular block: a paragraph or a header will parse the text using "inline"
rules, a code block may use a syntax highlighter, a list item or a block quote will
parse for nested block content.


## Text decoration

### Bold text

A text between `{*` and `*}` will be rendered as **bold**:

| wikimark               | renders as             |
|------------------------|------------------------|
| `{*bold text*}`        | **bold text**          |
| `{*f*}irst letter`     | **f**irst letter       |
| `{* nested {*bold*}*}` | **&nbsp;nested bold**  |

At the same time, it is a syntax error to have an opening `{*` without closing it, and
similarly if there is a closing `*}` without opening it first.

| wikimark          | renders as       |
|-------------------|------------------|
| `{*is this bold?` | ERROR            |
| `also not bold*}` | ERROR            |
| `\{*this is ok`   | {*this is ok     |


### Italic text

Text surrounded with slashes `{/` and `/}` will be rendered as italic:

| wikimark                 | renders as      |
|--------------------------|-----------------|
| `{/italic/}`             | *italic*        |
| `{/F/}irst letter`       | *F*irst letter  |
| `{/nested {/italic/}/}`  | *nested italic* |
| `{/this is not ok`       | ERROR           |
| `{/this {*is not/} ok*}` | ERROR           |


### Higlight/insert/delete

A text surrounded with `{=`, `=}` will be shown highlighted; to show the text with a
strike-through ("deleted") use `{-` / `-}`; for text with an underscore ("inserted") 
use `{+`, `+}`:

| wikimark               | renders as                    |
|------------------------|-------------------------------|
| `{=highlighted text=}` | <mark>highlighted text</mark> |
| `{-deleted text-}`     | <del>deleted text</del>       |
| `{+inserted text+}`    | <ins>inserted text</ins>      |


### Super/subscript

A text delimited with `{_`, `_}` becomes a subscript; text surrounded with `{^`, `^}`
is rendered in superscript:

| wikimark           | renders as                   |
|--------------------|------------------------------|
| `C{_2_}H{_5_}OH`   | C<sub>2</sub>H<sub>5</sub>OH |
| `E = mc{^2^}`      | E = mc<sup>2</sup>           |


### Verbatim text

A text surrounded with backticks `` ` ``, or with ``{` `` / `` `}`` pairs, is
considered **verbatim** ("code"). Such text is rendered in a monospace font, and not
processed for any further Wikimark syntax -- not even backslash-escaping.

| wikimark               | renders as         |
|------------------------|--------------------|
| `` `2 + 2 = 4` ``      | `2 + 2 = 4`        |
| ``{`may contain `s`}`` | ``may contain `s`` |


### Hard line break

A backslash at the end of a line (before the newline) indicates a "hard break", which
corresponds to the `<br/>` element in HTML.

<table>
<tr><th>wikitext<th>renders as</tr>
<tr>
<td><pre>once\
upon a time</pre></td>
<td><p>once<br/>upon a time</p></td>
</tr></table>


### Non-breaking space

A tilde `~` between two non-whitespace characters indicates a non-breaking space
(Unicode U+00A0, HTML `&nsbp;`). This character looks like a simple space, but doesn't
allow a line break at that point.

| wikimark    | renders as     |
|-------------|----------------|
| `Dr.~House` | Dr.&nbsp;House |


### Inline comment

A comment is a text surrounded with `{%`, `%}` delimiters. The text inside is removed
from the output completely.

| wikimark                   | renders as   |
|----------------------------|--------------|
| `Hello, {%strange%} world` | Hello, world |

If necessary, an inline comment may continue on several lines, but it may not extend
beyond the boundary of the current block. Each line must also be correctly indented
according to the rules of the current block:

```wikimark
- This is a list item {% with a comment that extends
  across several lines. The comment must still be
  correctly indented, as demanded by the list item
  block. %} that is perfectly normal thank you very much.
```


### Regular text

Any characters that do not have special meaning are treated as literal text.

Whenever a character needs to be treated literally without creating a syntactic
structure, it can be escaped with a backslash. All ASCII punctuation characters can be
escaped in this way, for example `\*` denotes a literal asterisk `*`, and `\@` is the
same as `@`.

Any Unicode characters may be present in the input, except those in the following
ranges: `\x00 - \x09`, `\x0B - \x1F`, and `\x7F - \x9F`.


## Links

### Page links

The most common type of link in Wikimark is a link to another page. This is
accomplished by putting the name of that page in square brackets. The name of the link
will be the same as the target:

| wikimark               | renders as                                          |
|------------------------|-----------------------------------------------------|
| `[Another page]`       | <a href="Another page">Another page</a>             |
| `[Fallout: New Vegas]` | <a href="Fallout: New Vegas">Fallout: New Vegas</a> |

If the link is immediately followed by non-whitespace non-punctuation characters, then
those will "bleed into" the link -- they will be considered part of the text of the
link, but not part of the name of the target page:

| wikimark         | renders as                       |
|------------------|----------------------------------|
| `[Weapon]s`      | <a href="Weapon">Weapons</a>     |
| `[Peace]fulness` | <a href="Peace">Peacefulness</a> |

The text inside the square brackets allows markup. In this case the name of the target
is obtained by stripping all markup and converting the content to plain text:

| wikimark    | renders as                       |
|-------------|----------------------------------|
| `[H{_2_}O]` | <a href="H2O">H<sub>2</sub>O</a> |

Note that it is invalid to have a link inside a link.

If the title of the page contains characters `/` or `#`, then they must be escaped:

| wikimark            | renders as                                    |
|---------------------|-----------------------------------------------|
| `[Alien\/Predator]` | <a href="Alien%47Predator">Alien/Predator</a> |
| `[Hospital \#3]`    | <a href="Hospital %353">Hospital #3</a>       |


### Intra-page links

If you want to link to a specific section of the same page, then the `#`-link can be
used: just put the name of the section as-is after a `#` character and a space. The
text of the link will not include the `#` character:

| wikimark               | renders as                                       |
|------------------------|--------------------------------------------------|
| `[# Super/subscript]`  | <a href="#Super-subscript">Super/subscript</a>   |
| `[# Intra-page links]` | <a href="#Intra-page-links">Intra-page links</a> |

This syntax for linking to a specific heading on a page is similar to the syntax
for writing the heading itself -- except that we never use more than one `#` to write
such a heading.

The text of the link may contain markup, just like the text of the header can have
markup. Those do not have to be the same, the link will work as long as its plain-text
version matches the plain-text version of the heading:

| wikimark            | renders as                                    |
|---------------------|-----------------------------------------------|
| `[# /Italic/ text]` | <a href="#Italic-text"><i>Italic</i> text</a> |

It is worth noting that the text of the heading is matched in a case-sensitive matter.
That is, `[# italic]` is not a valid link for a section named "Italic".


### Link definitions

A link which is used somewhere in the document may be given a definition at some other
place in that document. This is done by putting the name of the link in square
brackets on a separate line, followed by a colon, and then followed by the link's
intended target:

```wikimark
[this page]: Target page
[example]: http://example.com/
```

By themselves, these definitions do not render into anything. However, when the same
links are used elsewhere on a page, they will use the provided targets:

| wikimark             | renders as                                         |
|----------------------|----------------------------------------------------|
| `For [example], see` | For <a href="http://example.com/">example</a>, see |
| `[this page].`       | <a href="Target page">this page</a>.               |

In a Wikimark document, link definitions may appear anywhere on a page, but must be
within their own "paragraph", separated from other content by at least one blank line.

The text of a link definition should not contain any markup (backslash-escapes can
still be used). The actual link as used in the text may contain markup, however. The
text of a link will be matched to the link definition after the markup was stripped.
Thus, `[/example/]` is also a valid link that uses the `[example]:` definition.

The text of a link is matched in a case-sensitive matter. Thus, `[Example]` and
`[example]` are two different links.

When writing link definitions, if a certain link has no definition, then it uses the
next link's definition. Thus, in the following sample all three defintions have the
same target:

```wikimark
[Example]:
[for example]:
[example]: http://example.com/
```

If a link has a particularly long name, then it can be split into multiple lines. In
this case the newline and any start-of-line indentation are removed from the link:

```wikimark
[Taumata]:
  https://en.wikipedia.org/wiki/Taumatawhakatangi%C2%ADhanga
  koauauotamatea%C2%ADturipukakapikimaunga%C2%ADhoronukupoka
  iwhen%C2%ADuakitanatahu#Name
```

In order to declare a link to a subsection of a particular internal page, write the
name of the page first, followed by ` # `, and then the name of the section:

```wikimark
[Camille]: Midtown NPCs # Camille
[Momo]: The Slums NPCs # Momo
```

Link definitions may appear anywhere on a page where a paragraph is allowed. Regardless
of their place on the page, they affect all links on the page, whether they appear
before or after the definitions. It is an error to define the same link name more than
once.

When a link is defined within a *template*, this definition only applies within that
template and does not extend to a page that uses that template. Also, the existence of
a link definition on a template page does not affect the type of the template -- for
example, the template can still be inline even if it contains link definitions that
look like a separate paragraph.


### Footnotes

A footnote is a special link that starts with a caret `^`. This "link" does not point
to any target, and instead must be defined elsewhere on the page (preferrably at the
bottom). The link's text will be replaced with a numeral and rendered in superscript.
There could be multiple references on the page to the same footnote.

The content of a footnote may be either inline or block. In the former case, the
content should be separated from the footnote name by a colon and a space. If it needs
to spill onto the next line, that line should be indented with as many spaces as needed
to line it up with the start of the content on the previos line. In the latter case,
the footnote name should be followed by colon + newline, and all the content should
be indented with 2 spaces:

```wikimark
[^note1]: Inline footnote
[^note2]: Very very very very very very 
          long inline footnote.
[^note3]:
  This footnote may contain multiple block elements
  such as paragraphs.

  > Or maybe even a blockquote?
```

All footnotes will be numbered consecutively in the order that they are encountered
on the page. It is an error to use a footnote without providing a definition for it.

All footnote definitions will be rendered at the bottom of the page, in the order
of their numerals (i.e. <sup>[1]</sup>, <sup>[2]</sup>, etc).


### Images

TODO


## Block elements

### Paragraph

A paragraph is the most common type of block in Wikimark. It consists of one or more
non-empty consecutive lines of text, where the first line cannot be interpreted as one
of the more specialized syntaxes listed below.

The lines of a paragraph should not be indented, and the paragraph should be surrounded
with blank lines above and below:

```wikimark
This is a simple paragraph.

This is another paragraph that
has several lines.
```

Wikimark's definition of a paragraph tries to match the common dictionary definition:
a small section of writing consisting of one or more sentences. To accommodate this
definition, the language allows for **extended paragraphs**, which may include small
sub-blocks, indented by two spaces. A sub-block may contain: a tight list (ordered or
unordered), an image, a code block, or a math formula. For example, this is considered
a single paragraph:

```wikimark
There are 10 types of people in the world:
  * those who know binary,
  * and those who don't.
```

When rendered, these three lines will appear without any extra inter-line spacing.


### Heading

A heading is a line that starts with 1 or more `#` signs, followed by a space. The
number of `#` signs determines the level of a heading: H1, H2, ..., up to H6. It is
an error to use more than six `#` signs.

The text of a header may contain arbitrary inline markup (except for links). If it
is too long, then it can spill onto the next line, indenting it with `header level + 1`
spaces:

```wikimark
# Header 1

## Header 2

###### Header 6, but it is also very long so
       that it spills onto the next line.
```

A header must be separated from the surrounding content by at least one blank line.

Each header automatically becomes a URL target, whose name is derived by stripping all
the markup, replacing all punctuation characters including spaces with dashes `-`,
stripping the dashes at the start/end of the header, and finally collapsing spans of
consecutive dashes into one. No case normalization is performed.

It is an error to have multiple headers on the page with the same normalized name.


### Blockquote

A block quote is a sequence of lines each starting with `>` and a space. The contents 
of a block quote can be any block elements.

```wikimark
> A blockquote with a paragraph. {% and this is
> a comment %}
>
> And a list:
>   - one,
>   - two,
>   - three.
```


### Block comment

A line that starts with a `{%` sequence followed by a newline, indicates the start of
a block comment. This comment extends until a line that starts with `%}`, also followed
by a newline. The text inside the comment is ignored and does not appear in the output
(however, comments are retained in the AST).

```wikimark
{%
  This is a block comment.
  Anything can happen inside, even invalid markup
  [[[oh horror!}
Or bad indendation.
%}
```

A block comment must be separated with blank lines from the surrounding content.


### Code block

TODO


### Unordered list

An unordered (bulleted) list is a sequence of list items, where each list item starts
with a `*` or `-`, followed by a space, and then by the content of that list item. The
content of each list item is parsed as a sequence of blocks, where each block is
indented with two spaces.

An unordered list may be either **tight** or **loose**. A *tight* list has the 
following features:

- Every list item has only one paragraph (or empty);
- There are no blank lines between the list items;
- A tight list may be used inside an extended paragraph.

```wikimark
* This is an example of a
* tight list
    - It may also contain sublists,
    - Provided those are also tight.
* A single list item may be long enough to warrant being
  wrapped onto the next line. This is fine as long as it
  is still just one paragraph.
```

In a *loose* list:

- Any list item may contain multiple paragraphs or other block elements;
- The list items are separated are separated from each other with blank lines;
- The list itself is surrounded with blank lines.

```wikimark
* This is an example of a loose list.

* At least one of its items contains more than one paragraph,
  which makes the entire list loose.

  This is another paragraph inside the list item.

  - A sub-list within the list item.
  - Since this sub-list is not part of the preceding paragraph,
    it only has 2 spaces of indentation instead of 4.
```


### Ordered list

An ordered list is a sequence of consecutive numbered list items. Each such list item
must start with a number marker, followed by one or more spaces, and then by the actual
text of the list item. If the content must wrap to the next line, then that line should
be indented with as many spaces as needed to align the start of that line with the
start of the text content on the preceding line.

Each numbered marker may use one of the following patterns, though consecutive list
items should use the same style. The following marker styles are supported:

|       |       |       |       |       |
|-------|-------|-------|-------|-------|
| `1.`  | `A.`  | `a.`  | `I.`  | `i.`  |
| `1)`  | `A)`  | `a)`  | `I)`  | `i)`  |
| `(1)` | `(A)` | `(a)` | `(I)` | `(i)` |

In addition, nested ordered lists may use the parent's number as a prefix, separated
with a `.`, a `-`, or `)`. If a dot separator is used, then the trailing dot in the
marker may be omitted. This means that the sub-lists can have markers such as `2.a`,
`I-3`, `(4.1)`, `2(4)(b)`, etc.

Similar to an unordered list, the ordered list can be either tight or loose, with the
same rules governing their formatting.

```wikimark
1. Ordered list, first item.
2. Second item
     2.a sub-item,
     2.b another sub-item.
4. Third item
     - an unordered list may be nested inside an
     - ordered list, and vice versa.
```


### Check list

A check list is a special kind of an unordered list where each list item has a check
box instead of a bullet marker. The following variants are supported:

```wikimark
-[ ] An empty checkbox;
-[*] Filled checkbox, marked with a ✓;
-[x] Failed checkbox, marked with an ✗;
-[-] The checkbox and the text of the list item are crossed-out;
-[?] A checkbox with a question mark in it;
-[!] A checkbox with an exclamation mark in it.
```


### Definition list

TODO


### Simple table

A table is a sequence of lines where each line starts and ends with a pipe `|`
character. A simple table has the following characteristics:

- Each cell may contain only inline elements;
- In Wikimark, each row spans just one line;
- There are no cell borders in the output table;
- Row spans are not allowed.

A simple table must have a single **row separator** line, which is a line containing
only `|`, `-`, or `:` characters. This must be either the first or the second line in
the table. If it is the second line, then the previous line contains table **headers**
(this is the most common case). If the row separator is the first line of the table, 
then the table has no headers.

```wikimark
| Letter | Morse code | NATO code |
|--------|------------|-----------|
|   A    | •-         | Alfa      |
|   B    | -•••       | Bravo     |
|   C    | -•-•       | Charlie   |
|   D    | -••        | Delta     |
```

The *row separator* line specifies the shape of the table: how many columns there are,
and what are their alignments. Each pair of proximate pipe characters `|` separated with
dashes `-` defines one column.

The pipe characters in all other rows must align with the row separator pipes. If in
any row a pipe character is missing where it should be, then that cell becomes merged.
It is an error to have an unescaped mis-aligned `|` character in any cell.

The content of each cell is parsed according to regular Wikimark inline rules, after
stripping any starting/trailing whitespace.

**Alignment**. The text alignment in each column may be specified in the row separator.
Normally, each column is defined as a series of dashes between two pipe characters. If
this run of dashes starts with a colon `:`, then that column is left-aligned; if it
ends with a colon `:`, then the column is right-aligned; if it both starts and ends
with a colon `:`, then the column is center-aligned.

Moreover, if the dash span of a column starts with two colons `::`, or ends with two
colons, or both -- then such a column is also dot-aligned, to the left, right, or
center. This only makes sense for a numeric column that has floating-point values: the
column will be justified in such a way that all decimal points will be vertically
aligned. In addition, this will select a font variant for that column where all digits
have the same width.

```wikimark
| Item        |    Price |
|-------------|--------::|
| Tomato      |    $3.59 |
| Lettuce     |    $2.99 |
| MacBook Pro | $2499    |
```


### Advanced table

An advanced table is similar to a simple table, with the following distinctions:

- All table cells have borders;
- Cells can have block content in addition to inline content;
- Cells can be merged both across columns and across rows.

Syntax-wise, the main difference between a simple table and an advanced table is that
in the advanced table every row has to be separated from the previous one using a row
separator. In order to designate the first row as the table headers, it must use a
"fat" separator row that has `=`s instead of `-`s. If a table doesn't have headers,
then its upper border must be "fat".

The position of the `|` characters inside the "fat" separator row tells Wikimark where
to expect the cell column boundaries. If any cell has no boundary, then it is assumed
to be merged horizontally with the next cell. Likewise, if a row separator has one of
the boundaries missing, then it is assumed that the cell is merged vertically with a
cell in the next row.

A cell may also use `#` mark instead of a pipe `|` as a column separator. In such a
case the cell is considered to be a row header.

Once the boundaries of all cells are determined, the content of those cells is cut out
into a separate buffer, a single space of indentation is removed from the start of each
line (assuming they all have at least one space of indentation), and all trailing
indentation is likewise removed. These lines are then processed as regular block
content.

```wikimark
|------------#----------|---------------|
| Header Col # Header cell with row span|
|============#==========|===============|
| Row Header # Cell A   | Cell B        |
|------------#----------|---------------|
| Two-row    # Cell C   | {/Italic      |
| span.      #          | text/}        |
|            #----------|---------------|
| Another    # Cell D   | Cell E        |
| paragraph. #          |               |
|------------#----------|---------------|
```
