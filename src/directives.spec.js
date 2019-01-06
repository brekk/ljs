import { fileDirective } from "./directives"
import { regex } from "./constants"

test(`fileDirective should do nothing when the match is not found`, () => {
  expect(typeof fileDirective).toEqual(`function`)
  expect(fileDirective(``, `xxxxxxxxxx`, `_`, () => {})).toBeFalsy()
})
test(`fileDirective should return success if a match was found`, () => {
  expect(
    fileDirective(`${__filename}`, `   `, regex.whitespace, () => {})
  ).toBeTruthy()
})
test(`fileDirective should barf`, () => {
  console.log("UNTS")
  expect(() => {
    try {
      fileDirective(
        __filename,
        "plain ../missing-file.md",
        regex.plain,
        () => {}
      )
    } catch (e) {
      console.log(e)
      throw e
    }
  }).toThrow()
})
