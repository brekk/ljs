import resolve from "rollup-plugin-node-resolve"
import cjs from "rollup-plugin-commonjs"
import cli from "rollup-plugin-cli"
import buble from "rollup-plugin-buble"
import cleanup from "rollup-plugin-cleanup"
import json from "rollup-plugin-json"
import progress from "rollup-plugin-progress"
import pkg from "./package.json"

const external = (pkg && pkg.dependencies
  ? Object.keys(pkg.dependencies)
  : []
).concat([`fs`, `assert`, `path`, `events`, `util`])

const plugins = [
  progress(),
  json(),
  cli(),
  resolve({
    jsnext: true,
    main: true,
    module: true,
    preferBuiltins: true
  }),
  cjs({ extensions: [`.js`, `.json`], include: `node_modules/**` }),
  buble(),
  cleanup({ comments: `none` })
]

export default [
  {
    input: `src/index.js`,
    external,
    output: [{ file: pkg.bin.ljs2, format: `cjs` }],
    plugins
  }
]
