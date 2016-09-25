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

  window.__ANGULAR_BATSCANNER__ = true

  const suject = new Subject()
  this.next = suject.next.bind(suject)

  //

  const source = eventAggregator.aggregateUntill(suject, rootComponent)

  //

  source.subscribe(function postMessage (aggregatedEvents) {
    console.log('#postMessage', aggregatedEvents)

    window.postMessage({
      source: 'foobar',
      payload: JSON.parse(JSON.stringify(aggregatedEvents))
    }, '*')
  })
}
