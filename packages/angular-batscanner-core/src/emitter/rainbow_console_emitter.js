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

//

var HOOKS_COLORS = {
  [LifecycleHooks.OnChanges]: 'color: red',
  [LifecycleHooks.OnInit]: 'color: lime',
  [LifecycleHooks.DoCheck]: 'color: indigo',
  [LifecycleHooks.AfterContentInit]: 'color: orange',
  [LifecycleHooks.AfterContentChecked]: 'color: chocolate',
  [LifecycleHooks.AfterViewInit]: 'color: green',
  [LifecycleHooks.AfterViewChecked]: 'color: olive',
  [LifecycleHooks.OnDestroy]: 'color: magenta'
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

    const onNewAggregaterEvents = (aggregatedEvents) => {
      const batscannerRainbowConsoleRender = () => this.groupLog(aggregatedEvents)
      window.requestIdleCallback(() => {
        window.requestIdleCallback(batscannerRainbowConsoleRender)
      })
    }

    source.subscribe(onNewAggregaterEvents)
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
