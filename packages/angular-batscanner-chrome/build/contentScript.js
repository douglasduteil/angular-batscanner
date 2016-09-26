(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

/* global chrome */

var source = 'angular-batscanner-content-script';
var port = chrome.runtime.connect({
  name: 'content-script'
});

port.onMessage.addListener(handleMessageFromDevtools);
port.onDisconnect.addListener(handleDisconnect);
window.addEventListener('message', handleMessageFromPage);

window.postMessage({
  hello: true,
  source: source
}, '*');

function handleMessageFromDevtools(message) {
  console.log('backend -> content-script');
  console.log(message);

  window.postMessage({
    payload: message,
    source: source
  }, '*');
}

function handleMessageFromPage(evt) {
  console.log('page -> content-script');

  if (evt.data && evt.data.source === 'angular-batscanner') {
    console.log('page -> content-script -> backend', evt.data);
    port.postMessage(evt.data.payload);
  }
}

function handleDisconnect() {
  console.log('backend  -> content-script -> xxx');
  window.removeEventListener('message', handleMessageFromPage);
  window.postMessage({
    payload: {
      type: 'event',
      evt: 'shutdown'
    },
    source: source
  }, '*');
}

})));
//# sourceMappingURL=contentScript.js.map
