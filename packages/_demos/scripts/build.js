'use strict'

const fs = require('fs')

const del = require('del')
const camelCase = require('camel-case')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')

const pkg = require('../package.json')

//

const destDirectory = 'lib'
const baseDirectory = 'playgournds'
const scriptToBuild = [
  {
    base: 'hero-list',
    file: 'hero-list-app/hero-list-app.module.js',
    name: 'hero-list-app'
  }
]

Promise.resolve()
  .then(() => del([].map(
    (meta) => `${baseDirectory}/${meta.base}/${destDirectory}`
  )))
  .then(() => Promise.all(
    [].concat(scriptToBuild.map(compileToUmd))
  ))
  .then(
    () => console.log('~~ Done ~~ '),
    (e) => console.error(e)
  )

//

function compileToUmd (meta) {
  return compile({
    name: meta.name,
    target: `${baseDirectory}/${meta.base}/${meta.file}`,
    dest: `${baseDirectory}/${meta.base}/${destDirectory}/${meta.name}.umd.js`,
    format: 'umd'
  })
}

//

function compile (options) {
  console.log('compile', options)
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
      globals: {
        'rxjs/Observable': 'Rx',
        'rxjs/Subject': 'Rx',
        '@angular/core': 'ng.core',
        '@angular/compiler': 'ng.compiler',
        '@angular/forms': 'ng.forms',
        '@angular/platform-browser': 'ng.platformBrowser'
      },
      dest: `${options.dest}`,
      format: options.format,
      sourceMap: true,
      moduleName: camelCase(options.name)
    })))
}
