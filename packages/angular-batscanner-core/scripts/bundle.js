'use strict'

const del = require('del')
const camelCase = require('camel-case')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const pkg = require('../package.json')

const destDirectory = 'bundles'
const targetFormats = ['umd']

Promise.resolve()
  .then(() => del([`${destDirectory}/*`]))
  .then(() => Promise.all([
    compileUmdPolyfill(),
    compileInAllFormats(targetFormats)
  ]))

//

function compileInAllFormats (formats) {
  return formats.reduce((memo, format) => {
    return memo.then(compile({
      target: 'src/index.js',
      dest: `${pkg.name}.${format}.js`,
      format
    }))
  }, Promise.resolve())
}

function compileUmdPolyfill () {
  return compile({
    target: 'src/umd-angular-polyfill.js',
    dest: 'umd-angular-polyfill.js',
    format: 'umd'
  })
}

//

function compile (options) {
  return Promise.resolve()
    .then(() => rollup.rollup({
      entry: options.target,
      external: Object.keys(pkg.dependencies),
      plugins: [
        babel({
          exclude: 'node_modules/**'
        })
      ]
    })
    .then(bundle => bundle.write({
      dest: `${destDirectory}/${options.dest}`,
      format: options.format,
      sourceMap: true,
      moduleName: camelCase(pkg.name)
    })))
}
