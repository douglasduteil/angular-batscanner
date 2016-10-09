/* global chrome */

const ports = {}

//

chrome.runtime.onConnect.addListener(onConnectToExtensionBackend)

//

function onConnectToExtensionBackend (port) {
  const {tab, name} = resolvePortType(port)

  if (!ports[tab]) {
    ports[tab] = {
      devtools: null,
      contentScript: null
    }
  }

  ports[tab][name] = port

  if (name === 'devtools' && !ports[tab].contentScript) {
    console.log(`new ${name} for tab n°${tab}`)
    installContentScript(tab)
  }

  if (ports[tab].devtools && ports[tab].contentScript) {
    console.log('devtools <- backend ' + tab + ' -> content-script')
    doublePipe(ports[tab])
  }
}

//

function resolvePortType (port) {
  return false ||
    isNumeric(port.name) && resolveAsDevtool(port) ||
    resolveAsContentScript(port)
}

function doublePipe (metaPort) {
  const {devtools, contentScript} = metaPort

  devtools.onMessage.addListener(lDevtools)
  function lDevtools (message) {
    console.log('devtools -> backend -> contentScript', message)
    contentScript.postMessage(message)
  }
  contentScript.onMessage.addListener(lContentScript)
  function lContentScript (message) {
    console.log('contentScript -> backend -> devtools', message)
    devtools.postMessage(message)
  }
  function shutdown () {
    console.log('contentScript x- backend -x devtools')
    devtools.onMessage.removeListener(lDevtools)
    contentScript.onMessage.removeListener(lContentScript)
    devtools.disconnect()
    contentScript.disconnect()

    metaPort.devtools = metaPort.contentScript = null
  }
  devtools.onDisconnect.addListener(shutdown)
  contentScript.onDisconnect.addListener(shutdown)
}

//

function resolveAsDevtool (port) {
  const tab = Number(port.name)
  const name = 'devtools'

  return { tab, name }
}

function resolveAsContentScript (port) {
  const tab = Number(port.sender.tab.id)
  const name = 'contentScript'

  console.log(`new ${name} for tab n°${tab}`)
  return { tab, name }
}

function isNumeric (str) {
  return +str + '' === str
}

function installContentScript (tabId) {
  chrome.tabs.executeScript(tabId, {
    file: '/lib/contentScript.js'
  }, function () {})
}

