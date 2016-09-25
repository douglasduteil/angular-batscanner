'use strict'

const del = require('del')
const camelCase = require('copyfiles')
const copyfiles = require('camel-case')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const pkg = require('../package.json')

const destDirectory = 'build'
const scriptToBuild = [
  'background',
  'contentScript',
  'main'
]

const htmlFilesToCopy = [
  'main.html',
  'panel.html'
]

Promise.resolve()
  .then(() => del([`${destDirectory}/*`]))
  .then(() => Promise.all(
    [].concat(scriptToBuild.map(compileToUmd))
      .concat(copyHtmlFiles(htmlFilesToCopy))
  ))

//

function compileToUmd (name) {
  return compile({
    target: `src/${name}.js`,
    dest: `${name}.js`,
    format: 'umd'
  })
}

function copyHtmlFiles (files) {
  return new Promise((resolve, reject) => {
    copyfiles(files)
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
        '@angular/compiler': 'ng.compiler'
      },
      dest: `${destDirectory}/${options.dest}`,
      format: options.format,
      sourceMap: true,
      moduleName: camelCase(pkg.name)
    })))
}
