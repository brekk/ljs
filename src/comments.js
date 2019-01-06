import curry from "lodash/fp/curry"
import filter from "lodash/fp/filter"
import forEach from "lodash/fp/forEach"

/**
 * @function range
 * @param {Object} comment - a comment Object
 * @return {boolean} isWithinRange
 */
export const range = curry(function _range(fromStart, toEnd, comment) {
  if (!comment || !comment.range) {
    throw new ReferenceError(`Expected to be able to access comment.range.`)
  }
  const output = comment.range[0] >= fromStart && comment.range[1] <= toEnd
  return output
})
/**
add whitespace to a range
@function addWhitespace
@param {string} raw - the original raw source
@param {Object} syntax - the parsed AST
@param {number} from - number start
@param {number} to - number end
@return {null} nothing
 */
export const addWhitespace = curry(function _addWhitespace(
  raw,
  syntax,
  tokens,
  fromStart,
  toEnd
) {
  //  debug.addWhitespace(`# input`, raw, syntax, tokens, fromStart, toEnd)
  if (!syntax || !syntax.comments) {
    throw new ReferenceError(`Expected to be able to access syntax.comments.`)
  }
  let ws
  const commentFilter = filter(range(fromStart, toEnd))
  const comments = commentFilter(syntax.comments)
  forEach(function _processComment(c) {
    if (c.range[0] !== fromStart) {
      ws = raw.substr(fromStart, c.range[0] - fromStart)
      tokens.push({
        type: `Whitespace`,
        value: ws,
        range: [fromStart, c.range[0]]
      })
    }
    tokens.push({
      type: `Comment`,
      value: c,
      range: c.range
    })
    fromStart = c.range[1]
  }, comments)
  if (fromStart !== toEnd) {
    ws = raw.substr(fromStart, toEnd - fromStart)
    tokens.push({
      type: `Whitespace`,
      value: ws,
      range: [fromStart, toEnd]
    })
  }
})
