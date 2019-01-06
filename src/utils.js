import curry from "lodash/fp/curry"
import { regex } from "./constants"
export const note = curry((x, fn) => fn)
/**
 * test whether a string is whitespace
 * @function isWhitespace
 * @param {string} x - string to test
 * @return {boolean} isItWhitespace?
 */
export const isWhitespace = note(`isWhitespace`)(x =>
  regex.whitespaceEnd.test(x)
)

/**
 * return an empty string when given a string matching a shebang i.e. #!/usr/bin/env node
 * @function stripShebang
 * @param {string} x - a string to test for shebang-iness
 * @return {string} the original string or an empty one
 */
export const stripShebang = note(`stripShebang`)(function _stripShebang(x) {
  const match = x.match(regex.shebang)
  return match ? x.substr(match[0].length) : x
})
