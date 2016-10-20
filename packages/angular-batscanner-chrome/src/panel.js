/* global chrome */

import { Component, NgModule, NgZone } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

import { DevToolModule } from 'angular-batscanner-devtool'

//

const backendConnection$ = new Subject()
const backendMessage$ = backendConnection$
  .switchMap(() => backendPortStream())

export function connectToTab () {
  backendConnection$.next()
}

//

const BatscannerPanelComponent = Component({
  selector: 'batscanner-panel',
  styles: [`
  :host {
    display: flex;
    overflow: hidden;
    flex-direction: column !important;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 0;
  }

  batscanner-debugger {
    flex: 1;
  }
  `],
  template: `
  <batscanner-debugger [state]="debuggerState$ | async"></batscanner-debugger>
  `
})
.Class({
  constructor: [NgZone, function BatscannerPanelComponent (ngZone) {
    this._ngZone = ngZone

    this.state$ = new Subject()

    //

    const forceTriggerZonetick = () => {}
    const batscannerPanelComponentForceZoneTick =
      () => this._ngZone.run(forceTriggerZonetick)
    const forceZoneTickOnIdle =
      () => window.requestIdleCallback(batscannerPanelComponentForceZoneTick)

    //

    const isOfTypeData = (state) => state.type === 'data'
    const returnsStateDataEvents = (state) => state.data.events
    this.debuggerState$ = this.state$
      .filter(isOfTypeData)
      .map(returnsStateDataEvents)
      .do(forceZoneTickOnIdle)

    const isOfTypeEvent = (state) => state.type === 'event'
    this.eventState$ = this.state$.filter(isOfTypeEvent)
  }],

  ngOnInit () {
    const onNewMessageFromExtensionBackend = (message) => {
      // console.log('backend -> panel')
      this.state$.next(message)
    }
    this.subscription = backendMessage$
      .subscribe(onNewMessageFromExtensionBackend)

    connectToTab()
  },

  ngOnDestroy () {
    console.log('BatscannerPanelComponent#ngOnDestroy')
    this.subscription.unsubscribe()
  }
})

const PanelModule = NgModule({
  imports: [
    window.ng.platformBrowser.BrowserModule,
    DevToolModule
  ],
  declarations: [
    BatscannerPanelComponent
  ],
  bootstrap: [ BatscannerPanelComponent ]
})
.Class({constructor: function PanelModule () {}})

//

document.addEventListener('DOMContentLoaded', function () {
  window.ng.platformBrowserDynamic
    .platformBrowserDynamic()
    .bootstrapModule(PanelModule)
})

//

function backendPortStream () {
  var port = chrome.runtime.connect({
    name: '' + chrome.devtools.inspectedWindow.tabId
  })

  port.postMessage({message: 'brand new backend connection here :)'})

  return Observable.create(function (observer) {
    const broadcastNext = observer.next.bind(observer)
    port.onMessage.addListener(broadcastNext)

    port.onDisconnect.addListener(() => {
      console.log('disconnect panel === complete ?')
      observer.complete()
    })

    return function () {
      console.log('disconnected from backend')
      port.onMessage.removeListener(broadcastNext)
      port.disconnect()
    }
  })
}
