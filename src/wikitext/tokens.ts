export const tokens = {
  whitespace: "whitespace",
  newline: "newline",
  text: "text",
  equalSignsRun: "equalSignsRun",
  singleQuotesRun: "singleQuotesRun",
  leftBraceRun: "leftBraceRun",
  rightBraceRun: "rightBraceRun",
  leftBracketRun: "leftBracketRun",
  rightBracketRun: "rightBracketRun",
  pipe: "pipe",
  leftAngleBracket: "leftAngleBracket",
  rightAngleBracket: "rightAngleBracket",
  colon: "colon",
  dash: "dash",
  ampersand: "ampersand",
  asterisk: "asterisk",
  hashSign: "hashSign",
  semicolon: "semicolon",
  equal: "equal",
  commentStart: "htmlCommentStart",
  commentBody: "htmlCommentBody",
  commentEnd: "htmlCommentEnd",
  htmlTagStart: "htmlTagStart",
  htmlTagEnd: "htmlTagEnd",
  htmlTagName: "htmlTagName",
  htmlBareWord: "htmlBareWord",
  htmlQuotedString: "htmlQuotedString",
  htmlUnknown: "htmlUnknown",
  htmlEntity: "htmlEntity",
} as const;

/** Location consists of a line number, and a column number, both 1-based. */
type Location = [number, number];

export type Token = {
  type: string;
  text: string;
  start: Location;
  end: Location;
};
