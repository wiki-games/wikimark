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
  htmlCommentStart: "htmlCommentStart",
  htmlCommentBody: "htmlCommentBody",
  htmlCommentEnd: "htmlCommentEnd",
  htmlTagStart: "htmlTagStart",
  htmlTagEnd: "htmlTagEnd",
  htmlTagName: "htmlTagName",
  htmlBareWord: "htmlBareWord",
  htmlQuotedString: "htmlQuotedString",
  htmlUnknown: "htmlUnknown",
  htmlEntity: "htmlEntity",
} as const;

export type Token = {
  type: string;
  text: string;
  start: [number, number];
  end: [number, number];
};
