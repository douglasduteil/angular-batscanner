'use strict'

const del = require('del')
const camelCase = require('camel-case')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const string = require('rollup-plugin-string')

const pkg = require('../package.json')

const destDirectory = 'lib'
const targetFormats = ['umd']

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
      external: Object.keys(pkg.dependencies),
      plugins: [
        string({
          include: '**/*.svg'
        }),
        babel({
          exclude: 'node_modules/**'
        })
      ]
    })
    .then(bundle => bundle.write({
      globals: {
        'd3': 'd3',
        'rxjs/Observable': 'Rx',
        'rxjs/Subject': 'Rx',
        '@angular/core': 'ng.core',
        '@angular/compiler': 'ng.compiler',
        '@angular/common': 'ng.common',
        '@angular/platform-browser': 'ng.platformBrowser'
      },
      dest: `${destDirectory}/${options.dest}`,
      format: options.format,
      sourceMap: true,
      moduleName: camelCase(pkg.name)
    })))
}
