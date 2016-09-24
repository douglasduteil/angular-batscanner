//

import {
  IS_PART_OF_THE_DEBUGGER,
  HAS_RUNTIME_METADATA_RESOLVER_HOOK
} from './constant.js'

//

export function needToBeScaned (directiveType) {
  let requireRuntimeMetadataResolverHooks = true
  requireRuntimeMetadataResolverHooks &= !directiveType[IS_PART_OF_THE_DEBUGGER]
  requireRuntimeMetadataResolverHooks &= !directiveType[HAS_RUNTIME_METADATA_RESOLVER_HOOK]

  return Boolean(requireRuntimeMetadataResolverHooks)
}

export function markAsScaned (directiveType) {
  directiveType[HAS_RUNTIME_METADATA_RESOLVER_HOOK] = true
}
