import fs from "fs"
import path from "path"
import R from "ramda"
import { getTokens, unindent, literate } from "../src/literate"
import { stripShebang, isWhitespace } from "./utils"
const relative = x => path.resolve(__dirname, x)

test(`isWhitespace will verify whether a given string is whitespace`, () => {
  expect.assertions(3)
  expect(typeof isWhitespace).toEqual(`function`)
  expect(isWhitespace(`   `)).toBeTruthy()
  expect(isWhitespace(`nope`)).toBeFalsy()
})
test(`stripShebang will remove a line which matches a shebang, i.e. '#!/usr/bin/env node'`, () => {
  expect.assertions(3)
  expect(typeof stripShebang).toEqual(`function`)
  expect(stripShebang(`#!/usr/bin/env node\n`)).toEqual(``)
  expect(stripShebang(`/usr/bin/env node\n`)).toEqual(`/usr/bin/env node\n`)
})

test(`getTokens should generate tokens for a given file`, () => {
  expect.assertions(2)
  expect(typeof getTokens).toEqual(`function`)
  const tokenized = getTokens(relative(`./fixtures/fixture-array.js`))
  const jsonFixture = relative(`./fixtures/fixture-array-tokens.json`)
  // (() => {
  //   fs.writeFileSync(jsonFixture, JSON.stringify(tokenized), `utf8`)
  // })()
  expect(tokenized).toEqual(JSON.parse(fs.readFileSync(jsonFixture, "utf8")))
})

test(`getTokens should ignore lines with the # directive`, () => {
  const tokenized = getTokens(relative(`./fixtures/fixture-array.js`))
  const iterator = R.pipe(
    R.map(R.path([`value`, `value`])),
    R.filter(R.identity),
    R.filter(x => x.indexOf(`visible`) > -1),
    R.length
  )
  const linesThatSayVisible = iterator(tokenized)
  expect(linesThatSayVisible).toEqual(1)
})
test(`unindent should unindent lines which are indented`, () => {
  expect.assertions(2)
  expect(typeof unindent).toEqual(`function`)
  const out = unindent(
    [``, `    0`, `    1`, `    2`, `  3  `, `    4    `].join(`\n`)
  )
  expect(out).toEqual(`0\n1\n2\n  3  \n4    \n`)
})
test(`literate`, () => {
  expect.assertions(2)
  expect(typeof literate).toEqual(`function`)
  const output = literate(relative(`./fixtures/fixture-array.js`), {
    code: true
  })
  // fs.writeFileSync(`./fixtures/fixture-array-literate.md`, output, `utf8`)
  const expected = fs.readFileSync(
    relative(`./fixtures/fixture-array-literate.md`),
    `utf8`
  )
  expect(expected).toEqual(output)
})
