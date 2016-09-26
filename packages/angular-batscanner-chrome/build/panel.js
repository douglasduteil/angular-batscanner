(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/core'), require('rxjs/Observable'), require('rxjs/Subject'), require('angular-batscanner-devtool')) :
  typeof define === 'function' && define.amd ? define(['exports', '@angular/core', 'rxjs/Observable', 'rxjs/Subject', 'angular-batscanner-devtool'], factory) :
  (factory((global.angularBatscannerChrome = global.angularBatscannerChrome || {}),global.ng.core,global.Rx,global.Rx,global.angularBatscannerDevtool));
}(this, (function (exports,_angular_core,rxjs_Observable,rxjs_Subject,angularBatscannerDevtool) { 'use strict';

/* global chrome */

//

var backendConnection$ = new rxjs_Subject.Subject();
var backendMessage$ = backendConnection$.startWith(1).switchMap(function () {
  return backendPortStream();
});

function connectToTab() {
  backendConnection$.next();
}

//

var BatscannerPanelComponent = _angular_core.Component({
  selector: 'batscanner-panel',
  template: '\n  <div>Hello batscanner-panel {{count}}</div>\n  <batscanner-debugger></batscanner-debugger>\n  '
}).Class({
  constructor: [_angular_core.NgZone, function BatscannerPanelComponent(ngZone) {
    this._ngZone = ngZone;
    this.count = 0;
  }],

  ngOnInit: function ngOnInit() {
    var _this = this;

    //const backendPort$ = backendPortStream()
    this.subscription = backendMessage$.subscribe(function () {
      console.log('backend -> panel');
      _this._ngZone.run(function () {
        _this.count++;
      });
    });

    connectToTab();
  },
  ngOnDestroy: function ngOnDestroy() {
    console.log('BatscannerPanelComponent#ngOnDestroy');
    this.subscription.unsubscribe();
  }
});

var PanelModule = _angular_core.NgModule({
  imports: [window.ng.platformBrowser.BrowserModule, angularBatscannerDevtool.DevToolModule],
  declarations: [BatscannerPanelComponent],
  bootstrap: [BatscannerPanelComponent]
}).Class({ constructor: function PanelModule() {} });

//

document.addEventListener('DOMContentLoaded', function () {
  window.ng.platformBrowserDynamic.platformBrowserDynamic().bootstrapModule(PanelModule);
});

//

function backendPortStream() {
  var port = chrome.runtime.connect({
    name: '' + chrome.devtools.inspectedWindow.tabId
  });

  port.postMessage({ message: 'brand new backend connection here :)' });

  return rxjs_Observable.Observable.create(function (observer) {
    var broadcastNext = observer.next.bind(observer);
    port.onMessage.addListener(broadcastNext);

    port.onDisconnect.addListener(function () {
      console.log('disconnect panel === complete ?');
      observer.complete();
    });

    return function () {
      port.onMessage.removeListener(broadcastNext);
    };
  });
}

exports.connectToTab = connectToTab;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=panel.js.map
