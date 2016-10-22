//

import {expect} from 'chai'

describe('batscanner_module', function () {
  before(cacheGlobalDependencies)

  it('should export BATSCANNER_PROVIDERS', function () {
    // given
    const batscannerModule = require('../src/batscanner_module.js')

    // when
    const BATSCANNER_PROVIDERS = batscannerModule.BATSCANNER_PROVIDERS

    // then
    expect(BATSCANNER_PROVIDERS).to.be.an.array
  })

  describe('injector', function () {
    it('should get the BatScannerCompileMetadataResolver as CompileMetadataResolver', function () {
      // given
      const {
        CompileMetadataResolver,
        COMPILER_PROVIDERS
      } = require('@angular/compiler')
      const {ReflectiveInjector} = require('@angular/core')

      const {BATSCANNER_PROVIDERS} = require('../src/batscanner_module.js')
      const {BatScannerCompileMetadataResolver} = require('../src/metadata_resolver.js')

      const injector = ReflectiveInjector.resolveAndCreate([
        COMPILER_PROVIDERS,
        BATSCANNER_PROVIDERS
      ])

      // when
      const metaResolver = injector.get(CompileMetadataResolver)

      // then
      expect(metaResolver).to.be.an.instanceof(BatScannerCompileMetadataResolver)
    })

    it('should get an array on BatscannerEventEmitter instances as BatscannerEventEmitter', function () {
      // given
      const {ReflectiveInjector} = require('@angular/core')

      const {BATSCANNER_PROVIDERS} = require('../src/batscanner_module.js')
      const {BatscannerEventEmitter} = require('../src/emitter/event_emitter.js')

      const injector = ReflectiveInjector.resolveAndCreate([
        BATSCANNER_PROVIDERS
      ])

      // when
      const emitters = injector.get(BatscannerEventEmitter)

      // then
      expect(emitters).to.be.an('array')
        .with.deep.property('[0]')
          .that.is.an.instanceof(BatscannerEventEmitter)
    })
  })
})

//

// HACK(@douglasduteil): pre-require to cache file imports
// pre-cache so future requires will not cost a lot a time
function cacheGlobalDependencies () {
  require('reflect-metadata')
  require('@angular/compiler')
  require('@angular/core')
  require('../src/batscanner_module.js')
}
