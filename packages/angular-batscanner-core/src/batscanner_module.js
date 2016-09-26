//

import {
  __compiler_private__ as ngCompilerPrivateParts // eslint-disable-line camelcase
} from '@angular/compiler'

import {BATSCANNER_ROOT_COMPONENT} from './constant.js'
import {BatScannerCompileMetadataResolver} from './metadata_resolver.js'
import {
  BatscannerEventEmitter,
  BatscannerWindowPostMessageEmitter,
  BatscannerEventAggregator
} from './emitter/index.js'

//

const { CompileMetadataResolver } = ngCompilerPrivateParts

//
export { BATSCANNER_ROOT_COMPONENT }
export const BATSCANNER_PROVIDERS = [
  // TODO(@douglasduteil): clarrify if must be required by default or not
  // Will throw
  // "DI Error caused by: No provider for Token BATSCANNER_ROOT_COMPONENT"
  // if not defined by the user
  // {provide: BATSCANNER_ROOT_COMPONENT, useValue: ''},

  {provide: CompileMetadataResolver, useClass: BatScannerCompileMetadataResolver},
  {provide: BatscannerEventEmitter, useClass: BatscannerWindowPostMessageEmitter},

  //

  BatscannerEventAggregator
]
