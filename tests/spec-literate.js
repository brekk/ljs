import fs from 'fs'
import test from 'ava'
import {
  getTokens,
  unindent,
  literate,
  regex,
  isWhitespace,
  stripShebang,
  fileDirective
} from '../src/literate'

test(`isWhitespace will verify whether a given string is whitespace`, (t) => {
  t.plan(3)
  t.is(typeof isWhitespace, `function`)
  t.truthy(isWhitespace(`   `))
  t.falsy(isWhitespace(`nope`))
})
test(`stripShebang will remove a line which matches a shebang, i.e. '#!/usr/bin/env node'`, (t) => {
  t.plan(3)
  t.is(typeof stripShebang, `function`)
  t.is(stripShebang(`#!/usr/bin/env node\n`), ``)
  t.is(stripShebang(`/usr/bin/env node\n`), `/usr/bin/env node\n`)
})
test(
  `fileDirective should do nothing when the match is not found`,
  (t) => {
    t.plan(2)
    t.is(typeof fileDirective, `function`)
    t.falsy(fileDirective(``, `xxxxxxxxxx`, `_`, () => {}))
  }
)
test(
  `fileDirective should return success if a match was found`,
  (t) => {
    t.plan(2)
    t.is(typeof fileDirective, `function`)
    t.truthy(fileDirective(`${__filename}`, `   `, regex.whitespace, () => {}))
  }
)
test(`getTokens should generate tokens for a given file`, (t) => {
  t.plan(2)
  t.is(typeof getTokens, `function`)
  const tokenized = getTokens(`./fixtures/fixture-array.js`)
  t.deepEqual(
    tokenized,
    JSON.parse(fs.readFileSync(`./fixtures/fixture-array-tokens.json`, `utf8`))
  )
})
test(`unindent should unindent lines which are indented`, (t) => {
  t.plan(2)
  t.is(typeof unindent, `function`)
  const out = unindent([
    ``,
    `    0`,
    `    1`,
    `    2`
  ].join(`\n`))
  t.is(out, `0\n1\n2\n`)
})
test(`literate`, (t) => {
  t.plan(2)
  t.is(typeof literate, `function`)
  const output = literate(`./fixtures/fixture-array.js`, {code: true})
  // fs.writeFileSync(`./fixtures/fixture-array-literate.md`, output, `utf8`)
  const expected = fs.readFileSync(`./fixtures/fixture-array-literate.md`, `utf8`)
  t.is(expected, output)
})
