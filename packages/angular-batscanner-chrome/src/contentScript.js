/* global chrome */

const source = 'angular-batscanner-content-script'
const port = chrome.runtime.connect({
  name: 'content-script'
})

port.onMessage.addListener(handleMessageFromDevtools)
port.onDisconnect.addListener(handleDisconnect)
window.addEventListener('message', handleMessageFromPage)

window.postMessage({
  hello: true,
  source
}, '*')

function handleMessageFromDevtools (message) {
  console.log('backend -> content-script')
  console.log(message)

  window.postMessage({
    payload: message,
    source
  }, '*')
}

function handleMessageFromPage (evt) {
  console.log('page -> content-script')

  if (evt.data && evt.data.source === 'foobar') {
    // console.log('page -> rep -> dev', evt.data);
    port.postMessage(evt.data.payload)
  }
}

function handleDisconnect () {
  console.log('backend -> xxx')
  window.removeEventListener('message', handleMessageFromPage)
  window.postMessage({
    payload: {
      type: 'event',
      evt: 'shutdown'
    },
    source
  }, '*')
}
