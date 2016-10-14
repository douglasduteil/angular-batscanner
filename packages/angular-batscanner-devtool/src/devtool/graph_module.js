//

import {NgModule} from '@angular/core'

import {RootSvgGraphComponent} from './graph/graph_component.js'
import {FlamechartComponent} from './graph/flamechart_compoent.js'
import {OverviewBrushComponent} from './graph/overview_brush_compoent.js'

export const GraphModule =
NgModule({
  declarations: [
    FlamechartComponent,
    OverviewBrushComponent,
    RootSvgGraphComponent
  ],
  exports: [
    RootSvgGraphComponent
  ],
  imports: [
  ]
})
.Class({constructor: function GraphModule () {}})
