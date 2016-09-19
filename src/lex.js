import curry from 'lodash/fp/curry'
import filter from 'lodash/fp/filter'
import forEach from 'lodash/fp/forEach'
import esprima from 'esprima'
import {debug as makeDebugger} from 'f-utility/dev/debug'

// unable to use annotate from debug here, 'cause it will interfere with curried functions
// as it only works with unary
const _debug = makeDebugger(`ljs2:lexer`)
const debug = {
  range: _debug([`range`]),
  addWhitespace: _debug([`addWhitespace`]),
  processComment: _debug([`addWhitespace`, `processComment`]),
  processToken: _debug([`addWhitespace`, `processToken`]),
  lex: _debug([`lex`])
}
/**
 * @function range
 * @param {object} comment - a comment object
 * @return {boolean} isWithinRange
 * @pure
 */
export const range = curry(function _range(from, to, comment) {
  debug.range(`# input`, from, to, comment)
  if (!comment || !comment.range) {
    throw new ReferenceError(`Expected to be able to access comment.range.`)
  }
  const output = comment.range[0] >= from && comment.range[1] <= to
  debug.range(`# output`, output)
  return output
})

/**
add whitespace to a range
@function addWhitespace
@curried
@impure
@param {string} raw - the original raw source
@param {object} syntax - the parsed AST
@param {number} from - number start
@param {number} to - number end
@return {null} nothing
 */
export const addWhitespace = curry(function _addWhitespace(raw, syntax, tokens, from, to) {
  debug.addWhitespace(`# input`, raw, syntax, tokens, from, to)
  if (!syntax || !syntax.comments) {
    throw new ReferenceError(`Expected to be able to access syntax.comments.`)
  }
  let ws
  const commentFilter = filter(range(from, to))
  const comments = commentFilter(syntax.comments)
  forEach(function _processComment(c) {
    debug.processComment(`# input`, c)
    if (c.range[0] !== from) {
      ws = raw.substr(from, c.range[0] - from)
      tokens.push({
        type: `Whitespace`,
        value: ws,
        range: [
          from,
          c.range[0]
        ]
      })
    }
    tokens.push({
      type: `Comment`,
      value: c,
      range: c.range
    })
    from = c.range[1]
  }, comments)
  if (from !== to) {
    ws = raw.substr(from, to - from)
    tokens.push({
      type: `Whitespace`,
      value: ws,
      range: [
        from,
        to
      ]
    })
  }
  debug.addWhitespace(`# mutated tokens`, tokens)
})

/**
 * A lexer, an es6 & fp-lite rewrite from the original ljs repo:
 * https://github.com/phadej/ljs/blob/master/lib/lex.js
 * @function lex
 * @curried
 * @param {object} options - optional inputs to be applied to esprima.parse
 * @param {string} raw - input source
 * @return {array} tokens
 */
export const lex = curry(function _lex(
  options, raw
) {
  debug.lex(`# input`, options, raw)
  const syntax = esprima.parse(raw, {
    ...options,
    tokens: true,
    loc: true,
    range: true,
    comment: true
  })
  const tokens = []
  let currRange = 0
  syntax.tokens.forEach(function _processToken(token) {
    debug.processToken(`# input`, token)
    if (token.range[0] !== currRange) {
      addWhitespace(raw, syntax, tokens, currRange, token.range[0])
    }
    tokens.push(token)
    currRange = token.range[1]
  })
  if (raw.length !== currRange) {
    addWhitespace(raw, syntax, tokens, currRange, raw.length)
  }
  debug.lex(`# output`, tokens)
  return tokens
})

export default lex
