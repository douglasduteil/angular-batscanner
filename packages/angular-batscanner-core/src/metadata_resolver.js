//

import {
  __compiler_private__ as ngCompilerPrivateParts
} from '@angular/compiler'

import {
  Injector,
  resolveForwardRef,
  __core_private__ as ngCorePrivateParts
} from '@angular/core'

import {BatscannerEventEmitter} from './emitter/event_emitter.js'
import {needToBeScaned, markAsScaned} from './metadata_reflector.js'
import {BATSCANNER_ID} from './constant.js'

//

const { LifecycleHooks, LIFECYCLE_HOOKS_VALUES } = ngCorePrivateParts
const { CompileMetadataResolver } = ngCompilerPrivateParts
let GLOBAL_ID = 0

//

export class BatScannerCompileMetadataResolver extends CompileMetadataResolver {
  constructor (
    // HACK(@douglasduteil): Force inject the injector in the CompileMetadataResolver
    _injector,
    //
    _ngModuleResolver,
    _directiveResolver,
    _pipeResolver,
    _viewResolver,
    _config,
    _console,
    _reflector
  ) {
    super(
      _ngModuleResolver,
      _directiveResolver,
      _pipeResolver,
      _viewResolver,
      _config,
      _console,
      _reflector
    )

    this._eventEmitter = _injector.get(BatscannerEventEmitter)
    this.isDirective = (type) => Boolean(_directiveResolver.resolve(type, false))
    this.isPipe = (type) => Boolean(_pipeResolver.resolve(type, false))
  }

  getTypeMetadata (directiveType, moduleUrl, dependencies) {
    const emitter = this._eventEmitter
    directiveType = resolveForwardRef(directiveType)

    if (this.isPipe(directiveType) && needToBeScaned(directiveType)) {
      markAsScaned(directiveType)
      // console.log('hooks on pipe ', directiveType.name)
      const existingTransform = directiveType.prototype.transform
      if (!existingTransform) {
        return super.getTypeMetadata(directiveType, moduleUrl, dependencies)
      }
      directiveType.prototype.transform = function transformBatScanner () {
        // console.log('ngPipeTransform', directiveType.name, Array.from(arguments))
        const start = window.performance.now()
        const result = existingTransform.call(this, ...arguments)
        const end = window.performance.now()

        //

        if (!this[BATSCANNER_ID]) {
          this[BATSCANNER_ID] = GLOBAL_ID++
        }
        emitter.next({
          id: this[BATSCANNER_ID],
          end,
          start,
          timestamp: window.performance.now(),
          type: 'ngPipeTransform',
          targetName: directiveType.name,
          target: directiveType,
          arguments: Array.from(arguments)
        })

        return result
      }

      return super.getTypeMetadata(directiveType, moduleUrl, dependencies)
    }
    if (!this.isDirective(directiveType) || !needToBeScaned(directiveType)) {
      return super.getTypeMetadata(directiveType, moduleUrl, dependencies)
    }

    //

    markAsScaned(directiveType)
    // console.log('hooks on directive ', directiveType.name)

    //

    directiveType.prototype = LIFECYCLE_HOOKS_VALUES.reduce(function (proto, lifecycleHook) {
      const lifecycleHookName = LifecycleHooks[lifecycleHook]
      const existingHook = proto[`ng${lifecycleHookName}`]

      proto[`ng${lifecycleHookName}`] = function (changes) {
        // console.log(`ng${lifecycleHookName}`, directiveType.name, Array.from(arguments))
        const start = window.performance.now()
        if (existingHook) {
          existingHook.call(this, changes)
        }
        const end = window.performance.now()

        if (!this[BATSCANNER_ID]) {
          this[BATSCANNER_ID] = GLOBAL_ID++
        }

        emitter.next({
          id: this[BATSCANNER_ID],
          end,
          start,
          timestamp: start,
          type: lifecycleHookName,
          targetName: directiveType.name,
          target: directiveType,
          changes: changes
        })
      }

      return proto
    }, directiveType.prototype)

    return super.getTypeMetadata(directiveType, moduleUrl, dependencies)
  }
}

BatScannerCompileMetadataResolver.ctorParameters =
  // Copy CompileMetadataResolver.ctorParameters
  CompileMetadataResolver.ctorParameters.map((token) => ({type: token.type}))
BatScannerCompileMetadataResolver.ctorParameters.unshift({ type: Injector })
