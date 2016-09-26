//

const { ng } = window

export const DevToolComponent = ng.core
  .Component({
    selector: 'batscanner-debugger',
    template: '<h1>My Batscanner Debugger App</h1>'
  })
  .Class({constructor: function AppComponent () {}})

export const DevToolModule = ng.core.NgModule({
  declarations: [ DevToolComponent ],
  exports: [ DevToolComponent ],
  imports: [ ng.platformBrowser.BrowserModule ]
})
.Class({constructor: function DevToolModule () {}})
