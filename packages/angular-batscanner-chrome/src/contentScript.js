/* global chrome */

const source = 'angular-batscanner-content-script'
const port = chrome.runtime.connect({
  name: 'content-script'
})

port.onMessage.addListener(handleMessageFromDevtools)
port.onDisconnect.addListener(handleDisconnect)
window.addEventListener('message', handleMessageFromPage)

console.log('content-script -> page', {type: 'event', event: 'handshake'})
window.postMessage({
  payload: {
    type: 'event',
    event: 'handshake'
  },
  source
}, '*')

function handleMessageFromDevtools (message) {
  console.log('backend -> content-script', message)
  const payload = message
  window.postMessage({payload, source}, '*')
}

function handleMessageFromPage (evt) {
  if (evt.data && evt.data.source === 'angular-batscanner') {
    console.log('page -> content-script -> backend', evt.data)
    port.postMessage(evt.data.payload)
  } else {
    console.log('page -> content-script', evt.data)
  }
}

function handleDisconnect () {
  console.log('backend  -> content-script -> xxx')
  window.removeEventListener('message', handleMessageFromPage)
  window.postMessage({
    payload: {
      type: 'event',
      event: 'shutdown'
    },
    source
  }, '*')
}
