//

import {
  __core_private__ as ngCorePrivateParts
} from '@angular/core'

//

const { LifecycleHooks: LifecycleHooksEnum } = ngCorePrivateParts

const LifecycleHooks = new Proxy(LifecycleHooksEnum, {
  get (target, prop) {
    return prop
  }
})

//

// Inspied by Blink timeline colors
// https://chromium.googlesource.com/chromium/blink/+/master/Source/devtools/front_end/timeline/TimelineUIUtils.js

export const LifecycleHooksColors = {
  [LifecycleHooks.OnChanges]: 'hsl(0, 66%, 70%)', // red
  [LifecycleHooks.OnInit]: 'hsl(112, 66%, 70%)', // green
  [LifecycleHooks.DoCheck]: 'hsl(55, 100%, 70%)', // yellow
  [LifecycleHooks.AfterContentInit]: 'hsl(155, 44%, 80%)', // blue/green
  [LifecycleHooks.AfterContentChecked]: 'hsl(182, 44%, 70%)', // blue/yellow
  [LifecycleHooks.AfterViewInit]: 'hsl(315, 40%, 80%)', // purple/green
  [LifecycleHooks.AfterViewChecked]: 'hsl(315, 40%, 70%)', // purple/yellow
  [LifecycleHooks.OnDestroy]: 'hsl(0, 0%, 80%)' // gray
}
