//

import {
  __core_private__ as ngCorePrivateParts,
  Class as InjectedClass,
  Injector
} from '@angular/core'
import {Subject} from 'rxjs/Subject'

import {BATSCANNER_ROOT_COMPONENT} from '../constant.js'
import {BatscannerEventAggregator} from './event_aggregator.js'

//

const { LifecycleHooks: LifecycleHooksEnum } = ngCorePrivateParts
const LifecycleHooks = new Proxy(LifecycleHooksEnum, {
  get (obj, prop) {
    return obj[obj[prop]]
  }
})

console.log(LifecycleHooks.OnInit)
//

var HOOKS_COLORS = {
  [LifecycleHooks.OnInit]: 'color: lime',
  [LifecycleHooks.AfterContentInit]: 'color: orange',
  [LifecycleHooks.AfterContentChecked]: 'color: chocolate',
  [LifecycleHooks.AfterViewInit]: 'color: green',
  [LifecycleHooks.AfterViewChecked]: 'color: olive',
  [LifecycleHooks.DoCheck]: 'color: indigo',
  [LifecycleHooks.OnChanges]: 'color: red'
}

export const BatscannerRainbowConsoleEmitter =
InjectedClass({
  constructor: [Injector, function BatscannerRainbowConsoleEmitter (injector) {
    const rootComponent = injector.get(BATSCANNER_ROOT_COMPONENT)
    const eventAggregator = injector.get(BatscannerEventAggregator)

    //

    this.subject = new Subject()
    this.hookColor = HOOKS_COLORS
    this.groupLogIndex = 0

    //

    const source = eventAggregator.aggregateUntill(this.subject, rootComponent)

    //

    source.subscribe((aggregatedEvents) => {
      window.requestIdleCallback(() => this.groupLog(aggregatedEvents))
    })
  }],

  next (event) {
    this.subject.next(event)
  },

  groupLog (aggregatedEvents) {
    const groupName = `#${this.groupLogIndex++} AngularCheckDetection +${aggregatedEvents.duration.toFixed(2)}ms`
    console.groupCollapsed(groupName)
    aggregatedEvents.events.forEach(this.logEvent.bind(this))
    console.groupEnd(groupName)
  },

  logEvent (event) {
    console.log(
      '%c■ %s%c - %s',
      HOOKS_COLORS[event.type],
      event.type,
      '',
      `${event.targetName} (${event.id})`
    )

    event.changes &&
    console.log(
      '%c  with changes%c : ',
      HOOKS_COLORS[event.type],
      '',
      event.changes
    )
  }
})
