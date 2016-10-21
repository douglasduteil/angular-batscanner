#!/usr/bin/env bash

mkdir -p dist

cp \
  --parents \
  --recursive \
  --update \
  \
  manifest.json \
  icons \
  lib \
  node_modules/zone.js/dist/zone.js \
  node_modules/reflect-metadata/Reflect.js \
  node_modules/rxjs/bundles/Rx.js \
  node_modules/@angular/core/bundles/core.umd.js \
  node_modules/@angular/common/bundles/common.umd.js \
  node_modules/@angular/compiler/bundles/compiler.umd.js \
  node_modules/@angular/platform-browser/bundles/platform-browser.umd.js \
  node_modules/@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js \
  node_modules/d3/build/d3.js \
  node_modules/angular-batscanner-devtool/lib/angular-batscanner-devtool.umd.js \
  \
  dist

cd dist
zip -r angular-batscanner-chrome-extension.zip *
mv angular-batscanner-chrome-extension.zip ..
cd ..

