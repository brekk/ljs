import curry from "lodash/fp/curry"
import * as esprima from "esprima"

import { addWhitespace } from "./comments"

/**
 * A lexer, an es6 & fp-lite rewrite from the original ljs repo:
 * https://github.com/phadej/ljs/blob/master/lib/lex.js
 * @function lex
 * @param {Object} options - optional inputs to be applied to esprima.parse
 * @param {string} raw - input source
 * @return {Array} tokens
 */
export const lex = curry(function _lex(options, raw) {
  const syntax = esprima.parse(
    raw,
    Object.assign({}, options, {
      tokens: true,
      loc: true,
      range: true,
      comment: true
    })
  )
  const tokens = []
  let currRange = 0
  syntax.tokens.forEach(function _processToken(token) {
    if (token.range[0] !== currRange) {
      addWhitespace(raw, syntax, tokens, currRange, token.range[0])
    }
    tokens.push(token)
    currRange = token.range[1]
  })
  if (raw.length !== currRange) {
    addWhitespace(raw, syntax, tokens, currRange, raw.length)
  }
  return tokens
})

export default lex
