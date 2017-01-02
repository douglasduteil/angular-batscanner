'use strict'

const del = require('del')
const camelCase = require('camel-case')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const babelrc = require('babelrc-rollup')
const pkg = require('../package.json')

const destDirectory = 'lib'
const targetFormats = ['umd']
const external = Object.keys(pkg.dependencies)
  .concat([
    'rxjs/Observable',
    'rxjs/Subject'
  ])

Promise.resolve()
  .then(() => del([`${destDirectory}/*`]))
  .then(() => Promise.all([
    compileInAllFormats(targetFormats)
  ]))
  .then(
    () => console.log('~~ Done ~~ '),
    (e) => console.error(e)
  )

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

//

function compile (options) {
  return Promise.resolve()
    .then(() => rollup.rollup({
      entry: options.target,
      external,
      plugins: [
        babel(Object.assign(
          {exclude: 'node_modules/**'},
          babelrc.default({path: '.babelrc.rollup.config.json'})
        ))
      ]
    })
    .then(bundle => bundle.write({
      globals: {
        'rxjs/Observable': 'Rx',
        'rxjs/Subject': 'Rx',
        '@angular/core': 'ng.core',
        '@angular/compiler': 'ng.compiler'
      },
      dest: `${destDirectory}/${options.dest}`,
      format: options.format,
      sourceMap: true,
      moduleName: camelCase(pkg.name)
    })))
}
