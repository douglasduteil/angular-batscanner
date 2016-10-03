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
      stroke-width: 1.5px;
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
      console.log('new state', this.state)

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
    console.log('new graph', svgElement, tooltipElement)
/*
    const margin = {top: 20, right: 20, bottom: 110, left: 40}
    const margin2 = {top: 500, right: 20, bottom: 30, left: 40}

    const svg = d3.select(svgElement)
    // d3.select(window).on('resize', resize)
    const width = +svg.attr("width") - margin.left - margin.right
    const height = +svg.attr("height") - margin.top - margin.bottom
    //const height2 = +svg.attr("height") - margin2.top - margin2.bottom
    const height2 = height - margin2.top - margin2.bottom */
// START

    const svgWidth = svgElement.clientWidth
    const svgHeight = svgElement.clientHeight
    const svg = d3.select(svgElement)
    const margin = {top: 90, right: 0, bottom: 30, left: 0}
    const margin2 = {top: 0, right: 0, bottom: svgHeight - 50, left: 0}
    const width = svgWidth - margin.left - margin.right
    const height = svgHeight - margin.top - margin.bottom
    const height2 = svgHeight - margin2.top - margin2.bottom

    //

    const x = d3.scaleTime().range([0, width])
    const x2 = d3.scaleTime().range([0, width])
    const y = d3.scaleLinear().range([0, height])
    const y2 = d3.scaleLinear().range([height2, 0])

    this._axis = {x, x2, y, y2}

    //

    const xAxis = d3.axisBottom(x)
    const xAxis2 = d3.axisBottom(x2)

    const brush = d3.brushX()
      .extent([[0, 0], [width, height2]])
      .on('brush end', brushed)

    var zoom = d3.zoom()
    .scaleExtent([1, Infinity])
    .translateExtent([[0, 0], [width, height]])
    .extent([[0, 0], [width, height]])
    .on('zoom', zoomed)

    var line = d3.line()
    .defined((d) => Boolean(d))
    .x(function (d) { return x(d.timestamp) })
    .y(function (d) { return y(d.id) })
    .curve(d3.curveStepAfter)

    var area = d3.area()
    .curve(d3.curveStepAfter)
    .defined(line.defined())
    .x(line.x())
    .y1(line.y())

    var area2 = d3.area()
    .curve(d3.curveStepAfter)
    .defined(line.defined())
    .x(function (d) { return x2(d.timestamp) })
    .y1(function (d) { return y2(d.id) })

    svg.append('defs').append('clipPath')
    .attr('id', 'clip')
  .append('rect')
    .attr('width', width)
    .attr('height', height)

    var context = svg.append('g')
    .attr('class', 'context')
    .attr('transform', 'translate(' + margin2.left + ',' + margin2.top + ')')

    var focus = svg.append('g')
    .attr('class', 'focus')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')

    //

    const focusAreaPath = focus.append('path')
    .attr('class', 'area')

    focus.append('g')
    .attr('class', 'axis axis--x')
    .call(xAxis)

    const focusLinePath = focus.append('path')
    .attr('class', 'line')

    const contextAreaPath = context.append('path')
    .attr('class', 'area')

    context.append('g')
    .attr('class', 'axis axis--x')
    .call(xAxis2)

    context.append('g')
      .attr('class', 'brush')
      .call(brush)
      // .call(brush.move, x.range())

    svg.append('rect')
    .attr('class', 'zoom')
    .attr('width', width)
    .attr('height', height)
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
    .call(zoom)

    //

    this._render = render

    //

    function brushed () {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return // ignore brush-by-zoom
      var s = d3.event.selection || x2.range()
      x.domain(s.map(x2.invert, x2))

      focusAreaPath.attr('d', area)
      focus.select('.axis--x').call(xAxis)
      svg.select('.zoom').call(zoom.transform, d3.zoomIdentity
      .scale(width / (s[1] - s[0]))
      .translate(-s[0], 0))
    }

    function zoomed () {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return // ignore zoom-by-brush
      var t = d3.event.transform
      x.domain(t.rescaleX(x2).domain())
      focus.select('.area').attr('d', area)
      focus.select('.line').attr('d', line)
      focus.select('.axis--x').call(xAxis)
      context.select('.brush').call(brush.move, x.range().map(t.invertX, t))

      focus.selectAll('.dot')
          .attr('cx', line.x())
          .attr('cy', line.y())
    }

    function render (data) {
      if (!data || !this._axis) {
        return
      }

      x.domain(d3.extent(data, function (d) { return d && d.timestamp }))
      y.domain([0, d3.max(data, function (d) { return d && d.id })])
      x2.domain(x.domain())
      y2.domain(y.domain())

      //   .attr('d', area)
      focusAreaPath.data([data]).attr('d', area)
      focusLinePath.data([data]).attr('d', line)
      contextAreaPath.data([data]).attr('d', area2)

      focus.select('.axis').call(xAxis)
      context.select('.axis').call(xAxis2)
      context.select('.axis').call(xAxis2)

      const dots = focus.selectAll('.dot')
          .data(data.filter(function (d) { return d }))
          .attr('cx', line.x())
          .attr('cy', line.y())
      dots.enter().append('circle')
          .attr('class', 'dot')
          .attr('cx', line.x())
          .attr('cy', line.y())
          // .attr('cy', line.y())
          .attr('r', 3.5)

      dots.exit().remove()
      // .data(data)
      // .enter()
      // .call(xAxis)

      // context.selectAll('.area')
      // .data(data)
      // .enter()

      // context.selectAll('.axis')
      // .data(data)
      // .enter()
      // .call(xAxis2)

      // context.selectAll('.brush')
      // .data(data)
      // .enter()
    }
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
