//

import {
  NgModule
} from '@angular/core'
const { ng } = window

const AppComponent = ng.core
  .Component({
    selector: 'bat-scanner-debugger',
    template: '<h1>My First Angular 2 App</h1>'
  })
  .Class({constructor: function AppComponent () {}})

export const PanelModule = ng.core.NgModule({
  imports: [ ng.platformBrowser.BrowserModule ],
  declarations: [ AppComponent ],
  bootstrap: [ AppComponent ]
})
.Class({constructor: function PanelModule () {}})
