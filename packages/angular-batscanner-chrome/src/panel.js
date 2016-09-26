/* global chrome */

import { Component, NgModule, NgZone } from '@angular/core'
import { Observable } from 'rxjs/Observable'
import { Subject } from 'rxjs/Subject'

import { DevToolModule } from 'angular-batscanner-devtool'

//

const backendConnection$ = new Subject()
const backendMessage$ = backendConnection$
  .startWith(1)
  .switchMap(() => backendPortStream())

export function connectToTab () {
  backendConnection$.next()
}

//

const BatscannerPanelComponent = Component({
  selector: 'batscanner-panel',
  template: `
  <div>Hello batscanner-panel {{count}}</div>
  <batscanner-debugger></batscanner-debugger>
  `
})
.Class({
  constructor: [NgZone, function BatscannerPanelComponent (ngZone) {
    this._ngZone = ngZone
    this.count = 0
  }],

  ngOnInit () {
    this.subscription = backendMessage$.subscribe(() => {
      console.log('backend -> panel')
      this._ngZone.run(() => {
        this.count++
      })
    })

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
  declarations: [ BatscannerPanelComponent ],
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
      port.onMessage.removeListener(broadcastNext)
    }
  })
}
