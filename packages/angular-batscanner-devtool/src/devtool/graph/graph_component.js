//

import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core'

import * as d3 from 'd3'

//

export const RootSvgGraphComponent =
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

    .flame-chart-entry-info {
      z-index: 200;
      position: absolute;
      background-color: white;
      pointer-events: none;
      padding: 2px;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0, 0, 0, 0.1);
    }

    .axis path,
    .axis line {
      fill: none;
      stroke: #000;
      shape-rendering: crispEdges;
    }

    .area {
      fill: lightsteelblue;
    }

    .line {
      fill: none;
      stroke: steelblue;
      stroke-width: 2.5px;
    }

    .dot {
      fill: white;
      stroke: steelblue;
      stroke-width: 1.5px;
    }

    .zoom {
      cursor: move;
      fill: none;
      pointer-events: all;
    }
  `],
  queries: {
    svgElement: new ViewChild('mySvg'),
    tooltipElement: new ViewChild('myTooltip')
  },
  template: `
  <svg
   #mySvg
   xmlns="http://www.w3.org/2000/svg"
   version="1.1"
  >
    <g bd-brush-x></g>
  </svg>

  <div class="flame-chart-entry-info" #myTooltip>
  </div>
  `
})
.Class({
  constructor: [ElementRef, function RootSvgGraphComponent (elementRef) {
    this._element = elementRef.nativeElement
    this.data = []
  }],

  ngOnChanges (changes) {
    if (changes.state && this._render) {
      this._render(this.state)
    }
  },

  ngAfterViewInit () {
    this._initializeGraph(
      this.svgElement.nativeElement,
      this.tooltipElement.nativeElement
    )
  },

  //

  _initializeGraph (svgElement, tooltipElement) {
    const margin = {top: 90, right: 0, bottom: 30, left: 0}

    const svg = d3.select(svgElement)

    const svgWidth = svgElement.clientWidth
    const svgHeight = svgElement.clientHeight

    const width = svgWidth - margin.left - margin.right
    const height = svgHeight - margin.top - margin.bottom

    this.alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('')

    this.g = svg.append('g').attr('transform', 'translate(32,' + (height / 2) + ')')

    this.flamegraph = flameGraph()
      .width(width)
      .height(height)

    this.flamechart = d3.call(this.flamegraph);
  },

  _render () {
    if (!this.g) {
      return
    }

    var t = d3.transition()
        .duration(750)

    const data = d3.shuffle( [
                  [10, 10], [100, 10], [100, 100], [10, 100]
                  ])

    const path = this.g.selectAll('path').data([data])
    path.attr('d', (d) => this.line(d) + 'Z')
        .style('stroke-width', 1)
        .style('stroke', 'steelblue');
    path.enter().append('svg:path').attr('d', (d) => this.line(d) + 'Z')
        .style('stroke-width', 1)
        .style('stroke', 'steelblue');
    path.exit().remove()
  }
  //
})

const BrushXComponent =
Directive({
  selector: '[bd-brush-x]'
})
.Class({
  constructor: [ElementRef, function RootSvgGraphComponent (elementRef) {
    this._element = elementRef.nativeElement
  }],

  ngOnInit () {
  }
})

//

export const GraphComponent = [
  RootSvgGraphComponent,
  BrushXComponent
]

//

function flameGraph () {
  console.log('d3 flamegraph')
}
