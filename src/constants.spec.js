import { regex } from "./constants"

test("regex", () => {
  expect(Object.keys(regex)).toEqual([
    `plain`,
    `include`,
    `ignore`,
    `whitespaceEnd`,
    `whitespace`,
    `newline`,
    `strippable`,
    `strippable2`,
    `EOF`,
    `shebang`
  ])
})
test(`regex.plain`, () => {
  expect(regex.plain.test("plain ")).toBeTruthy()
  expect(regex.plain.test(" plain ")).toBeTruthy()
})
test(`regex.include`, () => {
  expect(regex.include.test("include ")).toBeTruthy()
  expect(regex.include.test(" include ")).toBeTruthy()
})
test(`regex.ignore`, () => {
  expect(regex.ignore.test("# ")).toBeTruthy()
  expect(regex.ignore.test(" # ")).toBeTruthy()
})
test(`regex.whitespaceEnd`, () => {
  expect(regex.whitespaceEnd.test(" ")).toBeTruthy()
  expect(regex.whitespaceEnd.test("     ")).toBeTruthy()
})
test(`regex.whitespace`, () => {
  expect(regex.whitespace.test(" ")).toBeTruthy()
  expect(regex.whitespace.test("     ")).toBeTruthy()
})
test(`regex.newline`, () => {
  expect(regex.newline.test("\n")).toBeTruthy()
})
test(`regex.strippable`, () => {
  expect(regex.strippable.test(" \n")).toBeTruthy()
})
test(`regex.strippable2`, () => {
  expect(regex.strippable2.test(" ")).toBeTruthy()
  expect(regex.strippable2.test("\n")).toBeTruthy()
})
test(`regex.EOF`, () => {
  expect(regex.EOF.test("\n")).toBeTruthy()
  expect(regex.EOF.test("\n\n")).toBeTruthy()
})
