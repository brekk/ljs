import { isWhitespace, stripShebang } from "./utils"

test(`isWhitespace`, () => {
  expect(isWhitespace(" ")).toBeTruthy()
  expect(isWhitespace("nope")).toBeFalsy()
})

test(`stripShebang`, () => {
  expect(stripShebang("#!whatever")).toEqual("#!whatever")
  expect(stripShebang("#!/whatever/bin\n")).toEqual("")
  expect(stripShebang("#!/usr/bin/env node\n")).toEqual("")
})
