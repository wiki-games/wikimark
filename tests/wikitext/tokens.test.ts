import { expect, test } from "vitest";
import { reprToken, tokens } from "../../src/wikitext/tokens.js";

test("reprToken(text)", () => {
  expect(reprToken(null)).toBe("null");
});

test("reprToken(text)", () => {
  expect(
    reprToken({
      type: tokens.text,
      text: "hello",
      start: [1, 1],
      end: [1, 6],
    })
  ).toBe('Token.text("hello", start=(1,1), end=(1,6))');
});
