//

import {
  CompileMetadataResolver
} from '@angular/compiler'

import {
  Injector,
  resolveForwardRef,
  __core_private__ as ngCorePrivateParts
} from '@angular/core'

import {BatscannerEventEmitter} from './emitter/event_emitter.js'
import {needToBeScaned, markAsScaned, assignBatscannerId} from './metadata_reflector.js'
import {BATSCANNER_ID} from './constant.js'

//

const { LifecycleHooks, LIFECYCLE_HOOKS_VALUES } = ngCorePrivateParts

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
    const superGetTypeMetadata =
      (directiveType) => super.getTypeMetadata(
        directiveType, moduleUrl, dependencies
      )

    directiveType = resolveForwardRef(directiveType)

    return false ||
      this._scanTransformPipeHook(directiveType, superGetTypeMetadata) ||
      this._scanDirectiveHook(directiveType, superGetTypeMetadata) ||
      superGetTypeMetadata(directiveType)
  }

  //

  _emitEvent (emitFn) {
    this._eventEmitter.forEach(emitFn)
  }

  _emitNextEvent (event) {
    const emitNext = (emitter) => emitter.next && emitter.next(event)
    this._emitEvent(emitNext)
  }

  _emitPreviousEvent (event) {
    const emitPrevious = (emitter) => emitter.previous && emitter.previous(event)
    this._emitEvent(emitPrevious)
  }

  _scanDirectiveHook (directiveType, superGetTypeMetadata) {
    const haveToScanDirective =
      this.isDirective(directiveType) && needToBeScaned(directiveType)

    const emitPreviousEvent = this._emitPreviousEvent.bind(this)
    const emitNextEvent = this._emitNextEvent.bind(this)

    if (!haveToScanDirective) {
      return
    }

    markAsScaned(directiveType)

    directiveType.prototype = LIFECYCLE_HOOKS_VALUES.reduce(
      function activateAllTheHooks (proto, lifecycleHook) {
        const lifecycleHookName = LifecycleHooks[lifecycleHook]
        const ngLifecycleHookName = `ng${lifecycleHookName}`
        const existingHook = proto[ngLifecycleHookName]
        const batscannerHookFnName = `${directiveType.name}_${ngLifecycleHookName}BatScanner`

        // HACK(douglasduteil): ensure the hook function in named
        // Named function are the best ! Specially in the timeline devtool
        // This hack ensure that, when called by Angular, the batcanner hook fn
        // is named according the current event.
        //
        // eslint-disable-next-line no-new-func
        proto[ngLifecycleHookName] = new Function('fn', `
          return function ${batscannerHookFnName} () {
            return fn.apply(this,arguments)
          }
        `)(lifecycleHookFn)

        return proto

        //

        function lifecycleHookFn (changes) {
          assignBatscannerId(this)

          //

          // TODO(@douglasduteil): Cached inside the object
          const staticMeta = {
            id: this[BATSCANNER_ID],
            type: lifecycleHookName,
            targetName: directiveType.name,
            target: directiveType,
            changes: changes
          }

          emitPreviousEvent(Object.assign({}, staticMeta, {
            timestamp: window.performance.now()
          }))

          const start = window.performance.now()
          if (existingHook) {
            existingHook.call(this, changes)
          }
          const end = window.performance.now()

          emitNextEvent(Object.assign({}, staticMeta, {
            end,
            start,
            timestamp: window.performance.now()
          }))
        }
      },
      directiveType.prototype
    )

    return superGetTypeMetadata(directiveType)
  }

  _scanTransformPipeHook (pipeType, superGetTypeMetadata) {
    const haveToScanThisPipe =
      this.isPipe(pipeType) && needToBeScaned(pipeType)
    const existingTransform = (pipeType.prototype || {}).transform

    const emitPreviousEvent = this._emitPreviousEvent.bind(this)
    const emitNextEvent = this._emitNextEvent.bind(this)

    if (!haveToScanThisPipe || !existingTransform) {
      return
    }

    markAsScaned(pipeType)

    const batscannerHookFnName = `${pipeType.name}_transformBatScanner`

    // HACK(douglasduteil): ensure the hook function in named
    // Named function are the best ! Specially in the timeline devtool
    // This hack ensure that, when called by Angular, the batcanner hook fn
    // is named according the current event.
    //
    // eslint-disable-next-line no-new-func
    pipeType.prototype.transform = new Function('fn', `
      return function ${batscannerHookFnName} () {
        return fn.apply(this,arguments)
      }
    `)(transformBatScanner)

    //

    function transformBatScanner () {
      assignBatscannerId(this)

      //

      // TODO(@douglasduteil): Cached inside the object
      const staticMeta = {
        arguments: Array.from(arguments),
        id: this[BATSCANNER_ID],
        target: pipeType,
        targetName: pipeType.name,
        type: 'ngPipeTransform'
      }

      //

      emitPreviousEvent(Object.assign({}, staticMeta, {
        timestamp: window.performance.now()
      }))

      const start = window.performance.now()
      const result = existingTransform.call(this, ...arguments)
      const end = window.performance.now()

      emitNextEvent(Object.assign({}, staticMeta, {
        end,
        start,
        timestamp: window.performance.now()
      }))

      return result
    }

    return superGetTypeMetadata(pipeType)
  }
}

BatScannerCompileMetadataResolver.ctorParameters =
  // Copy CompileMetadataResolver.ctorParameters
  CompileMetadataResolver.ctorParameters.map((token) => ({type: token.type}))
BatScannerCompileMetadataResolver.ctorParameters.unshift({ type: Injector })
