import { range, addWhitespace } from "./comments"

test("range", () => {
  expect(() => range(0, 0, null)).toThrow()
  const comment = {
    range: [1, 2]
  }
  expect(range(0, 3, comment)).toBeTruthy()
  expect(range(1, 1, comment)).toBeFalsy()
})

test("addWhitespace", () => {
  expect(() => addWhitespace(null, null, null, null, null)).toThrow()
  const raw = "abcde"
  const syntax = {
    comments: [{ range: [0, 1] }]
  }
  const tokens = []
  const fromStart = 0
  const toEnd = 5
  expect(addWhitespace(raw, syntax, tokens, fromStart, toEnd)).toBeFalsy()
  expect(tokens).toEqual([
    { range: [0, 1], type: "Comment", value: { range: [0, 1] } },
    { range: [1, 5], type: "Whitespace", value: "bcde" }
  ])
})
