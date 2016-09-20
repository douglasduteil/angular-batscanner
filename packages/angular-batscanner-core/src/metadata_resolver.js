//

import {
  __compiler_private__ as ngCompilerPrivateParts // eslint-disable-line camelcase
} from '@angular/compiler'

import {Injector, resolveForwardRef} from '@angular/core'

import {BatscannerEventAggregator} from './event_aggregator.js'
import {needToBeScaned, markAsScaned} from './metadata_reflector.js'

//

const { CompileMetadataResolver } = ngCompilerPrivateParts

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
    this._eventAggregator = _injector.get(BatscannerEventAggregator)
  }

  getDirectiveMetadata (directiveType, throwIfNotFound) {
    directiveType = resolveForwardRef(directiveType);
    const meta = this._directiveCache.get(directiveType);

    if (!meta || !needToBeScaned(directiveType)) {
      return super.getDirectiveMetadata(directiveType, throwIfNotFound)
    }

    // directiveType.prototype = wrapAllLifeCyleHooksOf(directiveType)

    markAsScaned(directiveType)

    return super.getDirectiveMetadata(directiveType, throwIfNotFound)
  }
}

BatScannerCompileMetadataResolver.ctorParameters =
  // Copy CompileMetadataResolver.ctorParameters
  CompileMetadataResolver.ctorParameters.map((token) => ({type: token.type}))
BatScannerCompileMetadataResolver.ctorParameters.unshift({ type: Injector })
