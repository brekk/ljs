#!/usr/bin/env node
/* eslint-disable max-len */
/* eslint-disable spaced-comment */
/**
  # ljs2

  > Generate docs from your source

  [![CircleCI](https://circleci.com/gh/brekk/ljs2.svg?style=badge&circle-token=ba5f3371283ba17121f58a3645e3799598579755)](https://circleci.com/gh/brekk/ljs2)

  ## command line

  If `ljs2` is installed globally,
  you can use `ljs2` command line tool to process your literate javascript files

  ```sh
  $ ljs2 -c -o foo.md foo.js
  $ ljs2 --help
  ```
*/
/// plain ../../CHANGELOG.md
/// plain ../../CONTRIBUTING.md
/// plain ../../related-work.md
/// plain ../../LICENSE

const fs = require(`fs`)
const path = require(`path`)
const program = require(`commander`)

const {literate} = require(`../literate`)

const pkgJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, `..`, `..`, `package.json`)
).toString())

program.usage(`[options] file.js`)
program.version(pkgJson.version)
program.option(`-o, --output <file>`, `Output file`)
program.option(`--no-code`, `Don't include code in the output file`)
program.option(`--no-meld`, `Don't meld consecutive line-breaks into single`)

function cli(argv) {
  program.parse(argv)

  if (program.args.length !== 1) {
    process.stderr.write(`Error: input file is required`)
    process.stderr.write(program.help())
    return 0
  }

  // Literate
  const filename = program.args[0]
  let litContents
  try {
    litContents = literate(filename, { code: program.code })
  } catch (e) {
    process.stderr.write(`Error: while literating -- ` + e.message)
    return 1
  }

  // Meld
  if (program.meld) {
    litContents = litContents.replace(/\n\n+/g, `\n\n`)
  }

  // Output
  if (program.output) {
    fs.writeFileSync(program.output, litContents)
  } else {
    process.stdout.write(litContents)
  }
}

const ret = cli(process.argv)
process.exit(ret)
