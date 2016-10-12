//

import {NgModule} from '@angular/core'
import {BrowserModule} from '@angular/platform-browser'

import {GraphModule} from './graph_module.js'
import {DevtoolComponent} from './devtool_component.js'
import {IconComponent} from './icon_component.js'
import {NavbarComponent} from './navbar_component.js'

//

export const DevToolModule =
NgModule({
  declarations: [
    DevtoolComponent,
    IconComponent,
    NavbarComponent
  ],
  exports: [
    DevtoolComponent
  ],
  imports: [
    GraphModule,
    BrowserModule
  ]
})
.Class({constructor: function DevToolModule () {}})
