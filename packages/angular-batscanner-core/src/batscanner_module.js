//

import {
  __compiler_private__ as ngCompilerPrivateParts // eslint-disable-line camelcase
} from '@angular/compiler'

import {BatScannerCompileMetadataResolver} from './metadata_resolver.js'
import {BatscannerEventAggregator} from './event_aggregator.js'

//

const { CompileMetadataResolver } = ngCompilerPrivateParts

//

export const BATSCANNER_ROOT_COMPONENT = 'BATSCANNER_ROOT_COMPONENT'

export const BATSCANNER_PROVIDERS = [
  {provide: CompileMetadataResolver, useClass: BatScannerCompileMetadataResolver},

  BatscannerEventAggregator
]
