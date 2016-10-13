//

import {
  __core_private__ as ngCorePrivateParts,
  Class as InjectedClass,
  Injector
} from '@angular/core'

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
    this.hookColor = HOOKS_COLORS
  }],

  next (event) {
    console.log(
      '%c■ %s%c - %s',
      HOOKS_COLORS[event.type],
      event.type,
      '',
      event.targetName
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
