#!/usr/bin/env node
/**
  # ljs2

  > Generate docs from your source

  ## command line

  If `ljs2` is installed globally,
  you can use `ljs2` command line tool to process your literate javascript files

  ```sh
  $ ljs2 -c -o foo.md foo.js
  $ ljs2 --help
  ```
*/

import fs from 'fs'
import path from 'path'
import program from 'commander'

import literate from '../lib/literate'

const pkgJson = JSON.parse(fs.readFileSync(path.join(__dirname, `..`, `package.json`)).toString())

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
