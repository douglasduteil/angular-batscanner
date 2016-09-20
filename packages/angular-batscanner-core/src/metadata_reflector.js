//

import {
  IS_PART_OF_THE_DEBUGGER,
  HAS_RUNTIME_METADATA_RESOLVER_HOOK
} from './constant.js'

//

export function needToBeScaned (directiveType) {
  let requireRuntimeMetadataResolverHooks = true
  requireRuntimeMetadataResolverHooks = requireRuntimeMetadataResolverHooks && !directiveType[IS_PART_OF_THE_DEBUGGER]
  requireRuntimeMetadataResolverHooks = requireRuntimeMetadataResolverHooks && !directiveType[HAS_RUNTIME_METADATA_RESOLVER_HOOK]

  return requireRuntimeMetadataResolverHooks
}

export function markAsScaned (directiveType) {
  directiveType[HAS_RUNTIME_METADATA_RESOLVER_HOOK] = true
}
