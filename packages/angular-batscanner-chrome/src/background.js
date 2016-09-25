/* global chrome */

var ports = {}

chrome.runtime.onConnect.addListener(function (port) {
  var tab = null
  var name = null
  if (isNumeric(port.name)) {
    tab = port.name
    name = 'devtools'
    installContentScript(+port.name)
  } else {
    tab = port.sender.tab.id
    name = 'content-script'
  }

  if (!ports[tab]) {
    ports[tab] = {
      devtools: null,
      'content-script': null
    }
  }
  ports[tab][name] = port

  if (ports[tab].devtools && ports[tab]['content-script']) {
    doublePipe(ports[tab].devtools, ports[tab]['content-script'])
  }
})

function isNumeric (str) {
  return +str + '' === str
}

function installContentScript (tabId) {
  chrome.tabs.executeScript(tabId, {
    file: '/build/contentScript.js'
  }, function () {})
}

function doublePipe (one, two) {
  one.onMessage.addListener(lOne)
  function lOne (message) {
    // console.log('dv -> rep', message);
    two.postMessage(message)
  }
  two.onMessage.addListener(lTwo)
  function lTwo (message) {
    // console.log('rep -> dv', message);
    one.postMessage(message)
  }
  function shutdown () {
    one.onMessage.removeListener(lOne)
    two.onMessage.removeListener(lTwo)
    one.disconnect()
    two.disconnect()
  }
  one.onDisconnect.addListener(shutdown)
  two.onDisconnect.addListener(shutdown)
}
