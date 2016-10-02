//

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core'

import * as d3 from 'd3'

console.log(d3)
//

export const GraphComponent =
Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Native,
  inputs: [
    'state'
  ],
  selector: 'bd-graph',
  styles: [`
    :host {
      display: flex;
    }

    svg {
      flex: 1;
    }

    pre {
      flex: 1;
    }

    .flame-chart-entry-info {
      z-index: 200;
      position: absolute;
      background-color: white;
      pointer-events: none;
      padding: 2px;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    .axis path {
      display: none;
    }

    .axis line {
      stroke-opacity: .1;
      shape-rendering: crispEdges;
    }

    .axis {
      shape-rendering: crispEdges;
    }

    .x.axis line {
      stroke: #fff;
    }

    .x.axis .minor {
      stroke-opacity: .5;
    }

    .y.axis line,
    .y.axis path {
      fill: none;
      stroke: #000;
    }
  `],
  queries: {
    svgElement: new ViewChild('mySvg'),
    tooltipElement: new ViewChild('myTooltip')
  },
  template: `

  <pre>{{ state | json }}
  </pre>

  <div class="flame-chart-entry-info" #myTooltip>
  </div>
  `
})
.Class({
  constructor: [ElementRef, function GraphComponent (elementRef) {
    this._element = elementRef.nativeElement
    this.data = []
  }]
})
