const utils = require("nps-utils")
const { concurrent, series } = utils
const { nps: npsAll } = concurrent

// const seriesNPS = (...x) => `nps ` + x.join(` && nps `)
const sd = (script, description) =>
  description ? { script, description } : script

const SKIP_DEPCHECK_FOR = [
  `@babel/cli`,
  `@babel/core`,
  `@babel/plugin-transform-destructuring`,
  `@babel/preset-env`,
  `babel-core`,
  `babel-jest`,
  `depcheck`,
  `documentation`,
  `docusaurus`,
  `husky`,
  `jest`,
  `prettier-eslint`,
  `rollup`
]
const inner = 'map(y => y.replace(/`/g, "\\\\`"))'
const meta = `cat README.md | ./snang.js -p 'split(" ")' '${inner}' 'join(" ")' >> src/help.js`

module.exports = {
  scripts: {
    dependencies: sd(
      // `depcheck --specials=bin,eslint,babel --ignores=${SKIP_DEPCHECK_FOR}`,
      "echo depcheckiessssssss",
      `check dependencies`
    ),
    readme: sd(
      `documentation readme -s "API" src/**.js`,
      `regenerate the readme`
    ),
    lint: {
      description: `lint both the js and the jsdoc`,
      script: npsAll(`lint.src`, `lint.jsdoc`, `lint.project`),
      src: sd(`eslint src/*.js --env jest --fix`, `lint js files`),
      jsdoc: sd(
        `documentation lint src/*/*.js,-src/fixtures/*.js`,
        `lint jsdoc in files`
      ),
      project: sd(`clinton --no-inherit`, `lint project using clinton`)
    },
    test: sd(
      `NODE_ENV=test jest --verbose --coverage`,
      `run all tests with coverage`
    ),
    docs: {
      description: `auto regen the docs`,
      script: `documentation build src/**.js -f html -o docs`,
      serve: sd(`documentation serve src/**.js`, `serve the documentation`)
    },
    bundle: sd(
      series(`rollup -c rollup.config.js`, `chmod +x ljs2.js`),
      `generate bundles`
    ),
    regenerate: {
      readme: sd(
        `./snang.js --help > README.md && echo '## API' >> README.md`,
        `regenerate README from help text`
      ),
      help: sd(
        series(
          "echo '/* eslint-disable max-len */\nexport const HELP = `' > src/help.js",
          meta,
          "echo '`\n/* eslint-enable max-len */' >> src/help.js"
        ),
        "regenerate help from readme"
      )
    },
    care: sd(
      series(`nps bundle`, npsAll(`lint`, `test`, `readme`, `dependencies`)),
      `run all the things`
    ),
    generate: `nps bundle`
  }
}
