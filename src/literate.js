import fs from 'fs'
import path from 'path'
import assert from 'assert'
import glob from 'glob'

import forEach from 'lodash/fp/forEach'
import find from 'lodash/fp/find'
import map from 'lodash/fp/map'
import {debug as _debug, annotate} from 'f-utility/dev/debug'

import {lex} from './lex'


const namespace = `ljs2:literate`
const note = annotate(namespace)
const debug = _debug(namespace, [`base`])

export const regex = {
  plain: /^\s*plain\s+(.*?)\s*$/,
  include: /^\s*include\s+(.*?)\s*$/,
  whitespaceEnd: /^\s*$/,
  whitespace: /^(\s*)/,
  newline: /\n/,
  strippable: /^(?:\s*\n)+/,
  strippable2: /[\s\n]*$/,
  EOF: /\n+$/
}

/**
 * test whether a string is whitespace
 * @function isWhitespace
 * @param {string} x - string to test
 * @return {boolean} isItWhitespace?
 */
export const isWhitespace = note(`isWhitespace`)(
  (x) => regex.whitespaceEnd.test(x)
)

/**
 * return an empty string when given a string matching a shebang i.e. #!/usr/bin/env node
 * @function stripShebang
 * @pure
 * @param {string} x - a string to test for shebang-iness
 * @return {string} the original string or an empty one
 */
export const stripShebang = note(`stripShebang`)(
  function _stripShebang(x) {
    const match = x.match(/^#!\/[^\n]*\n/)
    return match ?
      x.substr(match[0].length) :
      x
  }
)

/**
 * @function fileDirective
 * @impure
 * @param {string} filename - file path
 * @param {string} value - value for comparison
 * @param {regex} comparison - regular expression to match value
 * @param {function} callback - a function to call for every file match
 * @async
 * @return {boolean} wasAnyThingMatched?
 */
export const fileDirective = note(`fileDirective`)(
  function _fileDirective(filename, value, comparison, callback) {
    const match = value.match(comparison)
    if (match) {
      const directivePattern = match[1]
      const globPattern = path.join(path.dirname(filename), directivePattern)
      const files = glob.sync(globPattern)
      if (files.length === 0) {
        throw new Error(directivePattern + ` doesn't match any files`)
      }
      files.forEach(callback)
      return true
    } else {
      return false
    }
  }
)

const magicIndicator = ` =>`

const commentHasMagicIndicator = (t) => {
  if (t && t.type && t.value && t.value.value) {
    return (t.type === `Comment`) &&
    (t.value.type === `Line`) &&
    (t.value.value.slice(0, magicIndicator.length) === magicIndicator)
  }
  return false
}

export const getTokens = note(`getTokens`)(
  function _getTokens(filename) {
    const source = fs.readFileSync(filename, `utf8`)
    const raw = stripShebang(source)
    const tokens = lex({sourceType: `module`}, raw)
    let resTokens = []
    forEach(note(`processToken`)(
      function _processToken(t) {
        let r
        if (commentHasMagicIndicator(t)) {
          const value = t.value.value.substr(magicIndicator.length + 1)
          debug(`### comment-line`, value)
          r = fileDirective(filename, value, regex.plain, note(`matchPlain`)(
            function _matchPlain(name) {
              resTokens.push({
                type: `Plain`,
                value: fs.readFileSync(name).toString()
              })
            })
          )
          if (r) {
            return
          }
          debug(`### passed explained`)
          r = fileDirective(filename, value, regex.include, note(`matchIncluded`)(
            function _matchIncluded(name) {
              resTokens = resTokens.concat(getTokens(name))
            })
          )
          if (r) {
            return
          }
          assert(false, `unknown directive: ` + value)
        } else {
          t.raw = raw.substr(t.range[0], t.range[1] - t.range[0])
          resTokens.push(t)
        }
      }
    ), tokens)
    resTokens.push({
      type: `EOF`,
      value: ``
    })
    return resTokens
  }
)

export const unindent = note(`unindent`)(
  function _unindent(value) {
    const lines = value.split(regex.newline)
    const first = find((l) => !isWhitespace(l), lines)
    const indent = first ?
      regex.whitespace.exec(first)[1] :
      ``
    // Drop empty lines at the beginning of the literate comment
    while (lines[0] !== undefined && isWhitespace(lines[0])) {
      lines.shift()
    }
    // unindent lines
    return map(note(`processLine`)(
      function _processLine(l) {
        if (l.indexOf(indent) === 0) {
          return l.replace(indent, ``)
        } else if (isWhitespace(l)) {
          return ``
        } else {
          return l
        }
      }
    ), lines).join(`\n`) + `\n`
  }
)

export const literate = note(`function`)(
  function _literate(filename, opts = {}) {
    const code = opts.code || false
    const codeOpen = opts.codeOpen || `\n\`\`\`js\n`
    const codeClose = opts.codeClose || `\n\`\`\`\n\n`
    const tokens = getTokens(filename)
    let state = `code`
    let content = ``
    let codeBuffer = ``
    function appendCode() {
      if (state === `code`) {
        state = `text`
        if (!isWhitespace(codeBuffer)) {
          content += codeOpen + codeBuffer.replace(
            regex.strippable, ``
          ).replace(
            regex.strippable2, ``
          ) + codeClose
        }
      }
    }
    function appendText(value) {
      if (content === ``) {
        content = value
      } else {
        content += `\n` + value
      }
    }
    forEach(note(`processToken`)(
      function processToken(t) {
        if (t.type === `Plain`) {
          appendCode()
          appendText(t.value)
        } else if (t.type === `EOF`) {
          appendCode()
          appendText(``)
        } else if (t.type === `Comment` && t.value.type === `Block` && t.value.value[0] === `*`) {
          appendCode()
          // literate comment
          const comment = t.value
          // block comment starting with /**
          const value = comment.value.slice(1)
          appendText(unindent(value))
        } else if (code) {
          if (state !== `code`) {
            state = `code`
            codeBuffer = ``
          }
          codeBuffer += t.raw
        }
      }
    ), tokens)
    // code at the end of the file
    appendCode()
    // newline EOF
    content = content.replace(regex.EOF, `\n`)
    return content
  }
)

export default literate
