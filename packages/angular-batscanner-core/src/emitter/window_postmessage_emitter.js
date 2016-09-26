//

import {Injector} from '@angular/core'
import {Subject} from 'rxjs/Subject'

import {BATSCANNER_ROOT_COMPONENT} from '../constant.js'

import {BatscannerEventAggregator} from './event_aggregator.js'

//

BatscannerWindowPostMessageEmitter.ctorParameters = [{ type: Injector }]
export function BatscannerWindowPostMessageEmitter (injector) {
  const rootComponent = injector.get(BATSCANNER_ROOT_COMPONENT)
  const eventAggregator = injector.get(BatscannerEventAggregator)

  //

  // HACK(@douglasduteil): handling extension handshaking.
  // the extension will be waiting for "__ANGULAR_BATSCANNER__" to inject a new
  // content script in the page. So it's safe to handle extension handshaking
  // here

  window.__ANGULAR_BATSCANNER__ = true
  window.addEventListener('message', handleMessageFromContentScript)

  const EVENT_BEHAVIOR_FN = {
    handshake () {
      const payload = { type: 'event', event: 'handshake' }
      console.log('page -> content-script -> backend -> devtool', payload)
      window.postMessage({
        source: 'angular-batscanner',
        payload
      }, '*')

      // TODO(douglasduteil): subscribe to the scanner stream here
      console.log('TODO(douglasduteil): subscribe to the scanner stream here')
    },
    shutdown () {
      // TODO(douglasduteil): shutdown scanner stream
      console.log('TODO(douglasduteil): shutdown scanner stream ')
    }
  }

  function handleMessageFromContentScript (evt) {
    if (!isValideContentScriptEvent(evt)) {
      return
    }

    console.log('content-script -> page', evt.data)

    const eventBehaviorFn = EVENT_BEHAVIOR_FN[evt.data.payload.event]

    if (!eventBehaviorFn) {
      return
    }

    eventBehaviorFn()
  }

  //

  const suject = new Subject()
  this.next = suject.next.bind(suject)

  //

  const source = eventAggregator.aggregateUntill(suject, rootComponent)

  //

  source.subscribe(function postMessage (aggregatedEvents) {
    window.postMessage({
      source: 'angular-batscanner',
      payload: {
        type: 'data',
        data: JSON.parse(JSON.stringify(aggregatedEvents))
      }
    }, '*')
  })
}

//

function isValideContentScriptEvent (evt) {
  return evt.data &&
    evt.data.source === 'angular-batscanner-content-script' &&
    evt.data.payload && evt.data.payload.type === 'event'
}
