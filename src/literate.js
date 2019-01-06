import fs from "fs"
import assert from "assert"

import forEach from "lodash/fp/forEach"
import find from "lodash/fp/find"
import map from "lodash/fp/map"

import { lex } from "./lex"
import { stripShebang, isWhitespace, note } from "./utils"

import { fileDirective } from "./directives"
import {
  regex,
  tokenTypes,
  NEWLINE,
  STAR,
  EMPTY,
  CODE,
  TEXT,
  codeFenceOpen,
  codeFenceClose,
  magicIndicator
} from "./constants"

export const commentHasMagicIndicator = note(`commentHasMagicIndicator`)(
  function _commentHasMagicIndicator(t) {
    if (t && t.type && t.value && t.value.value) {
      return (
        t.type === tokenTypes.comment &&
        t.value.type === `Line` &&
        t.value.value.slice(0, magicIndicator.length) === magicIndicator
      )
    }
    return false
  }
)

export const getTokens = note(`getTokens`)(function _getTokens(filename) {
  const source = fs.readFileSync(filename, `utf8`)
  const raw = stripShebang(source)
  const tokens = lex({ sourceType: `module` }, raw)
  let resTokens = []
  forEach(
    note(`processToken`)(function _processToken(t) {
      let r
      if (commentHasMagicIndicator(t)) {
        const value = t.value.value.substr(magicIndicator.length + 1)
        // debug(`### comment-line`, value)
        r = fileDirective(
          filename,
          value,
          regex.plain,
          note(`matchPlain`)(function _matchPlain(name) {
            resTokens.push({
              type: tokenTypes.plain,
              value: fs.readFileSync(name).toString()
            })
          })
        )
        if (r) {
          return
        }
        // debug(`### passed explained`)
        r = fileDirective(
          filename,
          value,
          regex.include,
          note(`matchIncluded`)(function _matchIncluded(name) {
            resTokens = resTokens.concat(getTokens(name))
          })
        )
        if (r) {
          return
        }
        assert(false, `unknown directive: ` + value)
      } else if (regex.ignore.test(t.value.value)) {
      } else {
        t.raw = raw.substr(t.range[0], t.range[1] - t.range[0])
        resTokens.push(t)
      }
    }),
    tokens
  )
  resTokens.push({
    type: tokenTypes.EOF,
    value: EMPTY
  })
  return resTokens
})

export const unindent = note(`unindent`)(function _unindent(value) {
  const lines = value.split(regex.newline)
  const first = find(l => !isWhitespace(l), lines)
  const indent = first ? regex.whitespace.exec(first)[1] : EMPTY
  // Drop empty lines at the beginning of the literate comment
  while (lines[0] !== undefined && isWhitespace(lines[0])) {
    lines.shift()
  }
  // unindent lines
  return (
    map(
      note(`processLine`)(function _processLine(l) {
        if (l.indexOf(indent) === 0) {
          return l.replace(indent, EMPTY)
        } else if (isWhitespace(l)) {
          return EMPTY
        } else {
          return l
        }
      }),
      lines
    ).join(NEWLINE) + NEWLINE
  )
})

export const literate = note(`function`)(function _literate(
  filename,
  opts = {}
) {
  const code = opts.code || false
  const codeOpen = opts.codeOpen || codeFenceOpen
  const codeClose = opts.codeClose || codeFenceClose
  const tokens = getTokens(filename)
  let state = CODE
  let content = EMPTY
  let codeBuffer = EMPTY
  function appendCode() {
    if (state === CODE) {
      state = TEXT
      if (!isWhitespace(codeBuffer)) {
        content +=
          codeOpen +
          codeBuffer
            .replace(regex.strippable, EMPTY)
            .replace(regex.strippable2, EMPTY) +
          codeClose
      }
    }
  }
  function appendText(value) {
    if (content === EMPTY) {
      content = value
    } else {
      content += NEWLINE + value
    }
  }
  forEach(
    note(`processToken`)(function processToken(t) {
      if (t.type === tokenTypes.plain) {
        appendCode()
        appendText(t.value)
      } else if (t.type === tokenTypes.EOF) {
        appendCode()
        appendText(EMPTY)
      } else if (
        t.type === tokenTypes.comment &&
        t.value.type === tokenTypes.block &&
        t.value.value[0] === STAR
      ) {
        appendCode()
        // literate comment
        const comment = t.value
        // block comment starting with /**
        const value = comment.value.slice(1)
        appendText(unindent(value))
      } else if (code) {
        if (state !== CODE) {
          state = CODE
          codeBuffer = EMPTY
        }
        codeBuffer += t.raw
      }
    }),
    tokens
  )
  // code at the end of the file
  appendCode()
  // newline EOF
  content = content.replace(regex.EOF, NEWLINE)
  return content
})

export default literate
