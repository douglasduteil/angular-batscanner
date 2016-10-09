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

const LIKECYCLE_HOOKS = [
  'AfterContentChecked',
  'AfterContentInit',
  'AfterViewChecked',
  'AfterViewInit',
  'DoCheck',
  'OnChanges',
  'OnInit'
]

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

    .timeline-overview > .axis > .tick > line {
      stroke: #dadada;
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
    this.proporstionData = []
    this.rootTime = null
  }],

  ngOnChanges (changes) {
    if (!(changes.state)) {
      return
    }

    var data = this.state || []
    var maxDeph = data.reduce((memo, e) => {
      if (Number.isNaN(Number(memo[e.id]))) {
        memo[e.id] = memo.length
        memo.length += 1
      }
      return memo
    }, {length: 0})

    var depth = (id) => maxDeph[id]

    if (!this.rootTime) {
      this.rootTime = (this.data[0] || data[0] || {}).timestamp
    }
    const relativeTime = this.rootTime
    console.log('data', data)
    console.log('relativeTime', relativeTime)
    if (!relativeTime) {
      return
    }
    const statee = data.map(function (e) {
      return Object.assign({}, e, {
        depth: depth(e.id),
        timestamp: e.timestamp - relativeTime
      })
    })

    statee.forEach((e) => { this.data.push(e) })

    window.Rx.Observable.from(data)
      .groupBy((x) => x.type)
      .flatMap((obs) => obs.count().map((v) => ({ [obs.key]: v })))
      .reduce(
        (memo, group) => Object.assign(memo, group),
        LIKECYCLE_HOOKS.reduce((memo, val) => Object.assign(memo, {[val]: 0}), {})
      )
      .subscribe((proportions) => {
        if (!data[0]) {
          return
        }
        const startTimestamp = data[0].timestamp - relativeTime
        const endTimestamp = data[data.length - 1].timestamp - relativeTime
        console.log(startTimestamp, endTimestamp)
        this.proporstionData.push(
          LIKECYCLE_HOOKS.reduce(
            (memo, val) => Object.assign(memo, {[val]: 0}),
            { timestamp: Math.max(0, startTimestamp) }
          )
        )

        this.proporstionData.push(Object.assign({}, proportions, {
          timestamp: startTimestamp + ((endTimestamp - startTimestamp) / 2)
        }))

        this.proporstionData.push(
          LIKECYCLE_HOOKS.reduce(
            (memo, val) => Object.assign(memo, {[val]: 0}),
            { timestamp: endTimestamp }
          )
        )
      })

    this._render()
  },

  ngAfterViewInit () {
    this._initializeGraph(
      this.svgElement.nativeElement,
      this.tooltipElement.nativeElement
    )
  },

  //

  _initializeGraph (svgElement, tooltipElement) {
    console.log('_initializeGraph', svgElement, tooltipElement)
    const margin = {top: 90, right: 0, bottom: 30, left: 0}

    const svg = this.svg = d3.select(svgElement)
    d3.select(window).on('resize', resize)

    const svgWidth = svgElement.clientWidth
    const svgHeight = svgElement.clientHeight

    const width = svgWidth - margin.left - margin.right
    const height = svgHeight - margin.top - margin.bottom

    const overviewAreaHeight = 90
    const overviewArea = {top: 0, right: 0, bottom: overviewAreaHeight, left: 0}

    const detailAreaHeight = svgHeight - overviewArea.top - overviewArea.bottom
    const detailArea = {top: overviewAreaHeight, right: 0, bottom: svgHeight - 50, left: 0}
    this.color = d3.scaleOrdinal(d3.schemeCategory10)

    //

    this.detailArea = {}
    const detailX = this.x = this.detailArea.x = d3.scaleLinear().domain([0, 1000]).range([0, width])
    const detailY = this.detailArea.y = d3.scaleLinear().domain([0, 10]).range([0, height])
    const detailXAxis = this.detailArea.xAxis = d3.axisBottom(detailX)
    const detailYAxis = this.detailArea.yAxis = d3.axisLeft(detailY)

    this.overviewArea = {}
    this.overviewArea.y = d3.scaleLinear()
      .domain([0, 10])
      .range([0, overviewAreaHeight])
      .clamp(true)
    const overviewXAxis = this.overviewArea.xAxis = d3.axisBottom(detailX)
      .tickFormat((p) => d3.format('d')(p) + ' ms')
      .tickSizeInner(overviewAreaHeight)
      .tickPadding(5 - overviewAreaHeight)

    const brush = d3.brushX()
      .extent([[0, 0], [width, overviewAreaHeight]])
      .on('brush end', brushed)

    let brushLastSelection = detailX.range()

    //

    const timelineOverview = svg
      .append('g')
      .attr('class', 'timeline-overview')
      .attr('transform', `translate(${overviewArea.left}, ${overviewArea.top})`)

    const timelineDetail = svg
      .append('g')
      .attr('class', 'timeline-details')
      .attr('transform', `translate(${detailArea.left}, ${detailArea.top})`)

    //

    this.overviewActivity = timelineOverview
      .append('g')
      .attr('class', 'timeline-overview-activity')

    timelineOverview
      .append('g')
      .attr('class', 'axis axis--x')
      .call(overviewXAxis)
      .attr('text-anchor', 'end')
    .selectAll('text')
      .attr('x', '-5')

    timelineOverview
      .append('g')
      .attr('class', 'brush')
      .call(brush)

    //

/*

    timelineOverview
      .append('g')
      .attr('class', 'axis axis--x')
      .call(xAxis)

    //

    svg.append('g')

    svg.append('g')
    .attr('class', 'axis axis--y')
    .call(yAxis)

    this.flamechart = svg.append('g')
      .attr('class', 'flamechart')
      .attr('transform', 'translate(0, 50)')

    this.rectangles = svg.append('g')
      .attr('class', 'rectangles')
      .attr('transform', 'translate(0, 50)')

    svg.append('g')
      .attr('class', 'brush')
      .call(brush)
      .call(brush.move, x.range())
*/
    //

    function brushed () {
      if (!(d3.event && d3.event.type === 'brush')) {
        return // ignore no brush events
      }
      brushLastSelection = d3.event.selection
    }

    function resize () {
      const width = svgElement.clientWidth
      const height = svgElement.clientHeight

      detailX.range([0, width])
      brush.extent([[0, 0], [width, overviewAreaHeight]])

      timelineOverview.select('.axis').call(overviewXAxis)
      // timelineOverview.call(yAxis.scale(y))
    }
  },

  _render () {
    const data = this.data
    const proporstionData = this.proporstionData
    console.log('_render data', data.slice(0))
    console.log('_render proporstionData', proporstionData.slice(0))
    if (!this.detailArea) {
      return
    }

    const {overviewArea, overviewActivity} = this
    const {color, flamechart, svg, x, xAxis, yAxis} = this
    var y = this.overviewArea.y

    const minmaxdomain = d3.extent([]
      .concat(d3.extent(data, (d) => d.timestamp - 1000))
      .concat(d3.extent(data, (d) => d.timestamp + (d.duration || 1) + 1000))
    )

    x.domain(minmaxdomain)
    y.domain([Math.max(d3.max(data, (d) => d.depth), 20), 0])
    svg.selectAll('.axis--x').call(overviewArea.xAxis)

    var stack = d3.stack()
    .keys(LIKECYCLE_HOOKS)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone)

    var series = stack(proporstionData)

    var area = d3.area()
    .x(function (d) { return x(d.data.timestamp) })
    .y0(function (d) { return y(d[0]) })
    .y1(function (d) { return y(d[1]) })
    .curve(d3.curveMonotoneX)
    // .curve(d3.curveNatural)
    /* .x(function(d) { return x(d.x); })
    .y0(function(d) { return y(d.y0); })
    .y1(function(d) { return y(d.y0 + d.y); }); */
    console.log(series)
    var paths = overviewActivity.selectAll('path')
      .data(series)

    paths.enter().append('path')
      .merge(paths)
      .attr('d', area)
      .style('fill', (d, i) => d3.rgb(color(i)).brighter(1.5))

    return

    //

    // const {color, flamechart, svg, x, xAxis, y, yAxis, detailArea} = this
    const itemHeight = 50
    const textMargin = 5

    // const minmaxdomain = d3.extent([]
    //   .concat(d3.extent(data, (d) => d.timestamp - 1000))
    //   .concat(d3.extent(data, (d) => d.timestamp + (d.duration || 1) + 1000))
    // )
    x.domain(minmaxdomain)
    y.domain([0, Math.max(d3.max(data, (d) => d.depth), 10)])
    svg.select('.axis--x').call(xAxis)
    svg.select('.axis--y').call(yAxis)

    const minX = x.domain()[0]
    console.log(x(minX + 1000))
    var selection = this.rectangles
      .selectAll('.block')
      .data(data)

    var newSection = selection.enter()
    var newBlock = newSection
    .append('g')
      .attr('class', 'block')

    newBlock.merge(selection)
      .attr('transform', (d, i) => `translate(${x(d.timestamp)}, ${y(d.depth)})`)

    newBlock.append('rect')
      .merge(newSection.selectAll('rect'))
      .attr('fill', (d, i) => d3.rgb(color(d.type)).brighter(1.5))
      .attr('height', (d) => y(1))
      .attr('width', (d) => x(minX + (d.duration || 1)))

    newBlock
      .append('foreignObject')
      .append('xhtml:div')
      .attr('class', 'label')
      .merge(newSection.selectAll('.label'))
      .style('display', (d) => (x(minX + (d.duration || 1)) < 50) ? 'none' : 'block')
      .attr('x', (d) => textMargin)
      .attr('y', (d) => itemHeight * (2.25 / 3))
      .attr('fill', '#000')
      .text((d) => `${d.type} @ ${d.targetName}`)
  },

  _renderr () {
    const data = this.data
    console.log('_render', data)
    if (!this.flamechart) {
      return
    }

    const {color, flamechart, svg, x, xAxis} = this
    const itemHeight = 50
    const textMargin = 5

    const startTime = d3.min(data, (d) => d.timestamp)
    const endTime = d3.max(data, (d) => d.timestamp)
    x.domain([startTime - 2000, endTime + 2000])
    svg.select('.axis').call(xAxis)

    //

    const newSections = flamechart.selectAll('g.section')
      .data(data)

    newSections.exit().remove()

    newSections
      .enter()
      .append('rect')
      .merge(newSections)
      .attr('width', (d) => x(x.domain()[0] + d.duration))
      .attr('height', itemHeight)
      .attr('fill', (d, i) => d3.rgb(color(d.type)).brighter(1.5))
      .style('stroke', '#fff')
      .style('stroke-width', 1)

    // const block = newSections
    // .merge(newSections.selectAll('.block'))
    //   .attr('transform', (d, i) => `translate(${x(d.start)}, ${d.id * itemHeight})`)

    // block
    //   .append('rect')
    //   .attr('width', (d) => x(x.domain()[0] + d.duration))
    //   .attr('height', itemHeight)
    //   .attr('fill', (d, i) => d3.rgb(color(d.type)).brighter(1.5))
    //   .style('stroke', '#fff')
    //   .style('stroke-width', 1)

    // newSections
    //   .append('foreignObject')
    //   .append('xhtml:div')
    //   .attr('class', 'label')
    //   .style('display', (d) => (x(x.domain()[0] + d.duration) < 100) ? 'none' : 'block')
    //   .attr('x', (d) => textMargin)
    //   .attr('y', (d) => itemHeight * (2.25 / 3))
    //   .attr('fill', '#000')
    //   .text((d) => `${d.type} @ ${d.name}`)
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
