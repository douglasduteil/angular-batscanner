(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

/* global chrome */

var ports = {};

//

chrome.runtime.onConnect.addListener(onConnectToExtensionBackend);

//

function onConnectToExtensionBackend(port) {
  var _resolvePortType = resolvePortType(port);

  var tab = _resolvePortType.tab;
  var name = _resolvePortType.name;


  if (!ports[tab]) {
    ports[tab] = {
      devtools: null,
      contentScript: null
    };
  }

  ports[tab][name] = port;

  if (ports[tab].devtools && ports[tab].contentScript) {
    console.log('devtools <- backend ' + tab + ' -> content-script');
    doublePipe(ports[tab]);
  }
}

//

function resolvePortType(port) {
  return false || isNumeric(port.name) && resolveAsDevtool(port) || resolveAsContentScript(port);
}

function doublePipe(metaPort) {
  var devtools = metaPort.devtools;
  var contentScript = metaPort.contentScript;


  devtools.onMessage.addListener(lDevtools);
  function lDevtools(message) {
    console.log('devtools -> backend -> contentScript', message);
    contentScript.postMessage(message);
  }
  contentScript.onMessage.addListener(lContentScript);
  function lContentScript(message) {
    console.log('contentScript -> backend -> devtools', message);
    devtools.postMessage(message);
  }
  function shutdown() {
    console.log('contentScript x- backend -x devtools');
    devtools.onMessage.removeListener(lDevtools);
    contentScript.onMessage.removeListener(lContentScript);
    devtools.disconnect();
    contentScript.disconnect();

    metaPort.devtools = metaPort.contentScript = null;
  }
  devtools.onDisconnect.addListener(shutdown);
  contentScript.onDisconnect.addListener(shutdown);
}

//

function resolveAsDevtool(port) {
  var tab = Number(port.name);
  var name = 'devtools';

  console.log('new ' + name + ' for tab n°' + tab);
  installContentScript(tab);
  return { tab: tab, name: name };
}

function resolveAsContentScript(port) {
  var tab = Number(port.sender.tab.id);
  var name = 'contentScript';

  console.log('new ' + name + ' for tab n°' + tab);
  return { tab: tab, name: name };
}

function isNumeric(str) {
  return +str + '' === str;
}

function installContentScript(tabId) {
  chrome.tabs.executeScript(tabId, {
    file: '/build/contentScript.js'
  }, function () {});
}

})));
//# sourceMappingURL=background.js.map
