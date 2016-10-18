//

import {
  __core_private__ as ngCorePrivateParts
} from '@angular/core'

//

const { LifecycleHooks } = ngCorePrivateParts

//

export class BatscannerPerformanceMarkEmitter {
  constructor () {
    this.markMemoById = {
    }
  }

  next (event) {
    // TODO(@douglasduteil): Cached uName
    const uName = `${event.targetName}(${event.id})#${event.type}`
    window.performance.mark(`-${uName}`)

    this._measure(event)
    this.markMemoById[event.id] =
      isAtAfterViewChecked(event.type) ? null : event.type
  }

  previous (event) {
    // TODO(@douglasduteil): Cached uName
    const uName = `${event.targetName}(${event.id})#${event.type}`
    window.performance.mark(`+${uName}`)
  }

  //

  _measure (event) {
    const latestMark = this.markMemoById[event.id]

    if (!latestMark || (latestMark === event.type)) {
      return
    }

    const eventName = `${event.targetName}(${event.id})#${latestMark}`
    const endMark = `${event.targetName}(${event.id})#${event.type}`

    window.performance.measure(eventName, `+${eventName}`, `+${endMark}`)

    if (isAtAfterViewChecked(event.type)) {
      window.performance.measure(endMark, `+${endMark}`, `-${endMark}`)
    }
  }
}

//

function isAtAfterViewChecked (type) {
  return LifecycleHooks[type] === LifecycleHooks.AfterViewChecked
}
