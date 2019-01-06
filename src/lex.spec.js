import fs from "fs"
import path from "path"
import keys from "lodash/fp/keys"
import { lex } from "./lex"
import { range, addWhitespace } from "./comments"

const commentObject = {
  type: `Comment`,
  value: {
    type: `Block`,
    value: [
      `*`,
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
      ` `
    ].join(`\n`),
    range: [33, 322],
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
  range: [33, 322],
  raw: [
    `/**`,
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
    ` */`
  ].join(`\n`)
}

// test(`addWhitespace should add whitespace to stuff`, (t) => {
//   expect.assertions(2)
//   expect(typeof addWhitespace).toEqual(`function`)
// })
test(`lex should generate a list of tokens`, () => {
  expect.assertions(2)
  const raw = lex(
    { sourceType: `module` },
    fs.readFileSync(
      path.resolve(__dirname, `./fixtures/fixture-array.js`),
      `utf8`
    )
  )
  // fs.writeFileSync(`./fixtures/fixture-array-lex.json`, JSON.stringify(raw), `utf8`)
  const rawLex = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, `./fixtures/fixture-array-lex.json`),
      `utf8`
    )
  )
  expect(keys(raw)).toEqual(keys(rawLex))
  expect(raw).toEqual(rawLex)
})

// test.only(`lex should addWhitespace when raw.length !== currRange`, () => {
//   const raw = lex(
//     { sourceType: "module" },
//     fs.readFileSync(
//       path.resolve(__dirname, "./fixtures/fixture-array.js"),
//       "utf8"
//     )
//   )
// })

test(`range should return a boolean based on what (from, to) numbers were given`, () => {
  expect.assertions(3)
  expect(typeof range).toEqual(`function`)
  const from = 33
  const to = 322
  const comment = Object.assign({}, commentObject)
  const output = range(from, to, comment)
  expect(output).toBeTruthy()
  const output2 = range(20, 30, comment)
  expect(output2).toBeFalsy()
})
test(`range should throw if comment doesn't have range property`, () => {
  expect.assertions(1)
  expect(() => range(1, 2, {})).toThrow()
})
test(`addWhitespace should throw if given a syntax input which lacks a comments node`, () => {
  expect(() => addWhitespace(`raw`, {}, [], 1, 1)).toThrow()
})
