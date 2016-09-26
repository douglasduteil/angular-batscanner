'use strict'

const fs = require('fs')

const del = require('del')
const camelCase = require('camel-case')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')

const pkg = require('../package.json')

//

const destDirectory = 'lib'
const scriptToBuild = [
  'background',
  'contentScript',
  'main',
  'panel'
]

const htmlFilesToCopy = [
  'main.html',
  'panel.html'
]

Promise.resolve()
  .then(() => del([`${destDirectory}/*`]))
  .then(() => Promise.all(
    [].concat(scriptToBuild.map(compileToUmd))
      .concat(htmlFilesToCopy.map(copyHtmlFiles))
  ))
  .then(
    () => console.log('~~ Done ~~ '),
    (e) => console.error(e)
  )

//

function compileToUmd (name) {
  return compile({
    target: `src/${name}.js`,
    dest: `${name}.js`,
    format: 'umd'
  })
}

function copyHtmlFiles (name) {
  const source = `src/${name}`
  const target = `${destDirectory}/${name}`
  return new Promise((resolve, reject) => {
    var rd = fs.createReadStream(source)
    rd.on('error', rejectCleanup)
    var wr = fs.createWriteStream(target)
    wr.on('error', rejectCleanup)
    function rejectCleanup (err) {
      rd.destroy()
      wr.end()
      reject(err)
    }
    wr.on('finish', resolve)
    rd.pipe(wr)
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
