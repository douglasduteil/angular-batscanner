'use strict'

/* global chrome */

var panelInstance = null
var panelCreated = null
var minimalRecheckMillisecoundTime = 2000

// Check to see if AngularBatscanner has loaded once per second in case React is added
// after page load
var loadCheckInterval = setInterval(function () {
  createPanelIfAngularBatscannerLoaded()
}, minimalRecheckMillisecoundTime)

createPanelIfAngularBatscannerLoaded()

//

chrome.devtools.network.onNavigated.addListener(function () {
  console.log('devtools detected reload !')
  loadCheckInterval = setInterval(function () {
    connectToExistingPanelIfAngularBatscannerLoaded()
  }, minimalRecheckMillisecoundTime)
})

//

function connectToExistingPanelIfAngularBatscannerLoaded () {
  if (!panelInstance) {
    return
  }

  clearInterval(loadCheckInterval)

  asyncIsBatscannerLoaded(function (pageHasNgBatScan, err) {
    if (!pageHasNgBatScan || !panelInstance) {
      return
    }

    connectToExistingPanel(panelInstance)
  })
}

function createPanelIfAngularBatscannerLoaded () {
  if (panelInstance || panelCreated) {
    clearInterval(loadCheckInterval)
    return
  }

  asyncIsBatscannerLoaded(function (pageHasNgBatScan, err) {
    if (!pageHasNgBatScan || panelInstance) {
      return
    }

    createPanel()
    clearInterval(loadCheckInterval)
  })
}

//

function connectToExistingPanel (panel) {
  if (!panel) {
    console.error('No panel :(')
    return
  }

  panel.connectToTab()
}

function createPanel () {
  chrome.devtools.panels.create('Angular BatScanner', '', 'lib/panel.html', function (panel) {
    panelCreated = true
    panel.onShown.addListener(function (window) {
      panelInstance = window.angularBatscannerChrome
    })
  })
}

function asyncIsBatscannerLoaded (callback) {
  return chrome.devtools.inspectedWindow.eval('!!(\n    window.__ANGULAR_BATSCANNER__\n  )', callback)
}
