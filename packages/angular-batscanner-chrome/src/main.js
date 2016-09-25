'use strict'

/* global chrome */

var panelCreated = false

chrome.devtools.network.onNavigated.addListener(function () {
  createPanelIfTTTLoaded()
})

// Check to see if React has loaded once per second in case React is added
// after page load
var loadCheckInterval = setInterval(function () {
  createPanelIfTTTLoaded()
}, 1000)

createPanelIfTTTLoaded()

//

function createPanelIfTTTLoaded () {
  if (panelCreated) {
    return
  }

  asyncIsTTTLoaded(function (pageHasTTT, err) {
    if (!pageHasTTT || panelCreated) {
      return
    }

    createPanel()
    clearInterval(loadCheckInterval)
    panelCreated = true
  })
}

function createPanel () {
  chrome.devtools.panels.create('TTT', '', 'panel.html', function (panel) {})
}

function asyncIsTTTLoaded (callback) {
  return chrome.devtools.inspectedWindow.eval('!!(\n    window.TTT\n  )', callback)
}
