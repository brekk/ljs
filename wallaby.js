module.exports = function configureWallaby(wallaby) {
  return {
    files: [
      `src/**/*.js`,
      `src/*.js`
    ],

    tests: [
      `tests/**/*.js`,
      `tests/*.js`
    ],

    env: {
      type: `node`
    },

    compilers: {
      '**/*.js': wallaby.compilers.babel()
    },

    testFramework: `ava`,

    setup: function setupWallaby() {
      require(`babel-polyfill`)
    },

    debug: true
  }
}
