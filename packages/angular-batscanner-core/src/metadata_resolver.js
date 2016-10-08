//

import {
  __compiler_private__ as ngCompilerPrivateParts // eslint-disable-line camelcase
} from '@angular/compiler'

import {Injector, resolveForwardRef} from '@angular/core'
import {
  __core_private__ as ngCorePrivateParts // eslint-disable-line camelcase
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
  }

  getTypeMetadata (directiveType, moduleUrl, dependencies) {
    directiveType = resolveForwardRef(directiveType)

    if (!this.isDirective(directiveType) || !needToBeScaned(directiveType)) {
      return super.getTypeMetadata(directiveType, moduleUrl, dependencies)
    }

    //

    markAsScaned(directiveType)

    //

    const emitter = this._eventEmitter
    directiveType.prototype = LIFECYCLE_HOOKS_VALUES.reduce(function (proto, lifecycleHook) {
      const lifecycleHookName = LifecycleHooks[lifecycleHook]
      let existingHook = proto[`ng${lifecycleHookName}`]

      if (lifecycleHook === LifecycleHooks.OnInit) {
        const originalHook = proto.ngOnInit
        proto.ngOnInit = function ngOnInitBatScanner () {
          this[BATSCANNER_ID] = GLOBAL_ID++
          if (originalHook) {
            originalHook.call(this)
          }
        }

        existingHook = proto.ngOnInit
      }

      proto[`ng${lifecycleHookName}`] = function (changes) {
        if (existingHook) {
          existingHook.call(this, changes)
        }

        emitter.next({
          id: this[BATSCANNER_ID],
          timestamp: window.performance.now(),
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
