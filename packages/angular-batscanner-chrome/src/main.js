'use strict'

/* global chrome */

var panelInstance = null

// Check to see if AngularBatscanner has loaded once per second in case React is added
// after page load
var loadCheckInterval = setInterval(function () {
  createPanelIfAngularBatscannerLoaded()
}, 1000)

createPanelIfAngularBatscannerLoaded()

//

chrome.devtools.network.onNavigated.addListener(function () {
  console.log('devtools detected reload !')
  loadCheckInterval = setInterval(function () {
    connectToExistingPanelIfAngularBatscannerLoaded()
  }, 1000)
})

//

function connectToExistingPanelIfAngularBatscannerLoaded () {
  if (!panelInstance) {
    return
  }

  asyncIsBatscannerLoaded(function (pageHasNgBatScan, err) {
    if (!pageHasNgBatScan || !panelInstance) {
      return
    }

    connectToExistingPanel(panelInstance)
    clearInterval(loadCheckInterval)
  })
}

function createPanelIfAngularBatscannerLoaded () {
  if (panelInstance) {
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
  chrome.devtools.panels.create('Angular BatScanner', '', 'build/panel.html', function (panel) {
    panel.onShown.addListener(function (window) {
      panelInstance = window.angularBatscannerChrome
    })
  })
}

function asyncIsBatscannerLoaded (callback) {
  return chrome.devtools.inspectedWindow.eval('!!(\n    window.__ANGULAR_BATSCANNER__\n  )', callback)
}
