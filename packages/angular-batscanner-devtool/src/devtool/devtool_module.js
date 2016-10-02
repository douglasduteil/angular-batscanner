//

import {NgModule} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'

import {GraphComponent} from './graph/graph_component.js'
import {DevtoolComponent} from './devtool_component.js'
import {IconComponent} from './icon_component.js'
import {NavbarComponent} from './navbar_component.js'

//

export const DevToolModule =
NgModule({
  declarations: [
    DevtoolComponent,
    GraphComponent,
    IconComponent,
    NavbarComponent
  ],
  exports: [
    DevtoolComponent
  ],
  imports: [
    BrowserModule
  ]
})
.Class({constructor: function DevToolModule () {}})
