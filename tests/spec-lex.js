import fs from 'fs'
import test from 'ava'
import keys from 'lodash/fp/keys'
import {
  lex,
  addWhitespace,
  range
} from '../src/lex'

const commentObject = {
  type: `Comment`,
  value: {
    type: `Block`,
    value: [`*`,
      ` * @namespace util.array`,
      ` * @function join`,
      ` * @desc curried array.join with inverted parameter orders`,
      ` * @curried`,
      ` * @param {string} joiner - a string to join the array together with`,
      ` * @param {array} array`,
      ` * @return {string}`,
      ` * @example`,
      ` * <!--@join(\`x\`, [1,2,3])-->`,
      ` * <!--/@-->`,
      ` `].join(`\n`),
    range: [
      33,
      322
    ],
    loc: {
      start: {
        line: 3,
        column: 0
      },
      end: {
        line: 14,
        column: 3
      }
    }
  },
  range: [
    33,
    322
  ],
  raw: [`/**`,
  ` * @namespace util.array`,
  ` * @function join`,
  ` * @desc curried array.join with inverted parameter orders`,
  ` * @curried`,
  ` * @param {string} joiner - a string to join the array together with`,
  ` * @param {array} array`,
  ` * @return {string}`,
  ` * @example`,
  ` * <!--@join(\`x\`, [1,2,3])-->`,
  ` * <!--/@-->`,
  ` */`].join(`\n`)
}

// test(`addWhitespace should add whitespace to stuff`, (t) => {
//   t.plan(2)
//   t.is(typeof addWhitespace, `function`)
// })
test(`lex should generate a list of tokens`, (t) => {
  t.plan(2)
  const raw = lex({sourceType: `module`}, fs.readFileSync(`./fixtures/fixture-array.js`, `utf8`))
  // fs.writeFileSync(`./fixtures/fixture-array-lex.json`, JSON.stringify(raw), `utf8`)
  const rawLex = JSON.parse(fs.readFileSync(`./fixtures/fixture-array-lex.json`, `utf8`))
  t.deepEqual(raw, rawLex)
  t.deepEqual(keys(raw), keys(rawLex))
})
test(`range should return a boolean based on what (from, to) numbers were given`, (t) => {
  t.plan(3)
  t.is(typeof range, `function`)
  const from = 33
  const to = 322
  const comment = {...commentObject}
  const output = range(from, to, comment)
  t.truthy(output)
  const output2 = range(20, 30, comment)
  t.falsy(output2)
})
test(`range should throw if comment doesn't have range property`, (t) => {
  t.plan(1)
  t.throws(() => range(1, 2, {}))
})
test(`addWhitespace should throw if given a syntax input which lacks a comments node`, (t) => {
  t.throws(() => addWhitespace(`raw`, {}, [], 1, 1))
})
