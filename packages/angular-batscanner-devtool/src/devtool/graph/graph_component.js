//

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
  NgZone
} from '@angular/core'

import {Observable} from 'rxjs/Observable'

import * as d3 from 'd3'

//

const LIKECYCLE_HOOKS = [
  'OnChanges',
  'OnInit',
  'DoCheck',
  'AfterContentInit',
  'AfterContentChecked',
  'AfterViewInit',
  'AfterViewChecked',
  'ngOnDestroy'
]
const itemHeight = 25
const minimalMilliscondToDisplayText = 25

const log = console.log.bind(null, '%cRootSvgGraphComponent%c#', 'color: #1abc9c', 'color: #333')
//

export const RootSvgGraphComponent =
Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  exportAs: 'bdGraph',
  inputs: [
    'state'
  ],
  queries: {
    flamechart: new ViewChild('flamechart'),
    overview: new ViewChild('overview'),
    svgElement: new ViewChild('rootSvg'),
    tooltipElement: new ViewChild('myTooltip')
  },
  selector: 'bd-graph',
  styles: [`
    :host {
      display: flex;
    }

    svg {
      flex: 1;
    }
  `],
  template: `
    <svg
     #rootSvg
     xmlns="http://www.w3.org/2000/svg"
     version="1.1"
    >
       <g
         #overview="bdOverviewBrush"
         bd-overview-brush
         [data]="state"
         [width]="svgWidth"
         [height]="overviewHeight"
         (brushed)="_onOverviewBushed($event)"
        ></g>

      <g transform='translate(0, 90)'>
        <g
          #flamechart="bdFlamechart"
          bd-flamechart
          [data]="state"
          [width]="svgWidth"
          [height]="flameChartHeight"
          (zoom)="_onFlameChartZoom($event)"
        ></g>
      </g>
    </svg>

    <div class="flame-chart-entry-info" #myTooltip>
    </div>
  `
})
.Class({
  constructor: [ChangeDetectorRef, function RootSvgGraphComponent (ref) {
    this._ref = ref
    this.overviewHeight = 90
  }],

  ngOnInit () {
    Observable.fromEvent(window, 'resize')
      .debounceTime(300)
      .startWith(null)
      .subscribe(() => {
        this._resize()
        this._ref.detectChanges()
      })
  },

  //

  clear () {
    this.flamechart.clear()
    this.overview.clear()
  },

  //

  _onOverviewBushed (event) {
    const s = event.selection || this.overview.x.range()

    this.flamechart.x.domain(s.map(this.overview.x.invert, this.overview.x))
    d3.select(this.flamechart.axisElement.nativeElement)
      .call(this.flamechart.xAxis)

    const zoomTransform = d3.zoomIdentity
      .scale(this.svgWidth / (s[1] - s[0]))
      .translate(-s[0], 0)

    d3.select(this.flamechart.zoomElement.nativeElement)
      .call(this.flamechart.zoom.transform, zoomTransform)

    d3.select(this.flamechart.flameGroupElement.nativeElement)
      .call(this.flamechart.flames.bind(this.flamechart))
  },

  _onFlameChartZoom (event) {
    const t = event.transform

    this.flamechart.x.domain(t.rescaleX(this.overview.x).domain())

    d3.select(this.flamechart.axisElement.nativeElement)
      .call(this.flamechart.xAxis)

    d3.select(this.overview.brushElement.nativeElement)
      .call(
        this.overview.brush.move,
        this.flamechart.x.range().map(t.invertX, t)
      )

    d3.select(this.flamechart.flameGroupElement.nativeElement)
      .call(this.flamechart.flames.bind(this.flamechart))
  },

  _updateRootSVGSize () {
    const svgElement = this.svgElement.nativeElement
    this.svgWidth = svgElement.clientWidth
    this.svgHeight = svgElement.clientHeight

    this.flameChartHeight = this.svgHeight - this.overviewHeight
  },

  _resize () {
    this._updateRootSVGSize()
  }
})










































































export const RoootSvgGraphComponent =
Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Native,
  exportAs: 'bdGraph',
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
      stroke: #dadada;
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

    .zoom {
      cursor: move;
      fill: none;
      pointer-events: all;
    }

    rect {
      stroke: #EEEEEE;
      fill-opacity: .8;
    }

    rect:hover {
      stroke: #474747;
      stroke-width: 0.5;
    }

    .label {
      pointer-events: none;
      white-space: nowrap;
      text-overflow: ellipsis;
      overflow: hidden;
      font-size: 12px;
      font-family: Verdana;
      margin-left: 4px;
      margin-right: 4px;
      line-height: 1.5;
      padding: 0 0 0;
      font-weight: 400;
      color: black;
      text-align: left;
    }

  `],
  queries: {
    overviewElement: new ViewChild('overview'),
    svgElement: new ViewChild('rootSvg'),
    tooltipElement: new ViewChild('myTooltip')
  },
  template: `
  <svg
   #rootSvg
   xmlns="http://www.w3.org/2000/svg"
   version="1.1"
  >
    <g
     #overview="bdOverviewBrush"
     bd-overview-brush
     [data]="data"
     [width]="svgWidth"
     [height]="overviewHeight"
    ></g>
  </svg>

  <div class="flame-chart-entry-info" #myTooltip>
  </div>
  `
})
.Class({
  constructor: [ElementRef, NgZone, ChangeDetectorRef, function RoootSvgGraphComponent (elementRef, ngZone, cdRef) {
    log('constructor')
    this._element = elementRef.nativeElement
    this._ngZone = ngZone
    this._cdRef = cdRef

    this.data = []
    this.proporstionData = []
    this.rootTime = null

    //

    this.overviewHeight = 90
  }],

  ngOnChanges (changes) {
    log('ngOnChanges')
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
  },

  ngAfterViewInit () {
    log('ngAfterViewInit')
    this._initializeGraph(
      this.svgElement.nativeElement,
      this.tooltipElement.nativeElement,
      this.overviewBrush
    )
  },

  ngAfterViewChecked () {
    this._render()
  },

  //

  _initializeGraph (svgElement, tooltipElement, overviewGroupElement) {
    log('_initializeGraph')
    console.log(overviewGroupElement)
    const self = this

    const margin = {top: 90, right: 0, bottom: 0, left: 0}

    const svg = this.svg = d3.select(svgElement)

    const svgWidth = svgElement.clientWidth
    const svgHeight = svgElement.clientHeight

    this.svgWidth = svgWidth
    this.svgHeight = svgHeight
    d3.select(window).on('resize', resize)

    const width = svgWidth - margin.left - margin.right
    const height = svgHeight - margin.top - margin.bottom

    const overviewAreaHeight = 90
    const overviewArea = {top: 0, right: 0, bottom: overviewAreaHeight, left: 0}

    const detailAreaHeight = svgHeight - overviewArea.top - overviewArea.bottom
    const detailArea = {top: overviewAreaHeight, right: 0, bottom: svgHeight - 50, left: 0}
    this.color = d3.scaleOrdinal(d3.schemeCategory10)

    //

    this.detailArea = {}
    const detailX = this.detailArea.x = d3.scaleLinear().domain([0, 1000]).range([0, width])
    const detailXAxis = this.detailArea.xAxis = d3.axisBottom(detailX)
      .tickFormat((p) => d3.format('d')(p) + ' ms')
      .tickSizeInner(detailAreaHeight)
      .tickPadding(5 - detailAreaHeight)

    this.overviewArea = {}
    this.overviewArea.y = d3.scaleLinear()
      .domain([10, 0])
      .range([0, overviewAreaHeight])
      .clamp(true)

    const overviewX = this.overviewArea.x = d3.scaleLinear().domain([0, 1000]).range([0, width])
    const overviewXAxis = this.overviewArea.xAxis = d3.axisBottom(overviewX)
      .tickFormat((p) => d3.format('d')(p) + ' ms')
      .tickSizeInner(overviewAreaHeight)
      .tickPadding(5 - overviewAreaHeight)

    const brush = d3.brushX()
      .extent([[0, 0], [width, overviewAreaHeight]])
      .on('brush end', brushed)

      var zoom = d3.zoom()
        .scaleExtent([1, Infinity])
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
        .on('zoom', zoomed)

    //

    const timelineOverview = svg
      .append('g')
      .attr('class', 'timeline-overview')
      .attr('transform', `translate(${overviewArea.left}, ${overviewArea.top - 500})`)

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

    timelineDetail
    .append('g')
      .attr('class', 'axis axis--x')
      .call(detailXAxis)
      .attr('text-anchor', 'end')
    .selectAll('text')
      .attr('x', '-5')

    timelineDetail.append('rect')
      .attr('class', 'zoom')
      .attr('width', width)
      .attr('height', height)
      .call(zoom)

    this.rectangles = timelineDetail.append('g')
      .attr('class', 'rectangles')
      .attr('transform', 'translate(0, 20)')

    this.tooltip = d3.select(tooltipElement)
      .style('position', 'absolute')
      .style('z-index', '10')
      .style('visibility', 'hidden')
      .style('background-color', '#fff')
      .style('padding', '5px 10px')
      .text('')

    const renderBlocks = this._renderBlocks.bind(this)
    const render = this._render.bind(this)
    const {overviewElement} = this

    //

    function brushed () {
      if (!(d3.event && d3.event.type === 'brush')) {
        return // ignore no brush events
      }

      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return // ignore brush-by-zoom

      var s = d3.event.selection || overviewX.range()
      detailX.domain(s.map(overviewX.invert, overviewX))

      timelineDetail.select('.axis--x').call(detailXAxis)
      timelineDetail.select('.zoom').call(zoom.transform, d3.zoomIdentity
        .scale(width / (s[1] - s[0]))
        .translate(-s[0], 0))
      renderBlocks()
    }

    function zoomed () {
      if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') return // ignore zoom-by-brush

      var t = d3.event.transform
      detailX.domain(t.rescaleX(overviewX).domain())
      timelineDetail.select('.axis--x').call(detailXAxis)
      timelineOverview.select('.brush').call(
        brush.move,
        detailX.range().map(t.invertX, t)
      )

      renderBlocks()
    }

    function resize () {
      log('resize in zone ? ', NgZone.isInAngularZone())
      console.log(self)
      self._ngZone.run(() => {
        self.svgWidth = svgWidth
        self.svgHeight = svgHeight
        self._cdRef.markForCheck()
      })


      const width = svgElement.clientWidth
      const height = svgElement.clientHeight



      overviewElement.render()

      detailX.range([0, width])
      overviewX.range([0, width])

      overviewXAxis.tickSizeInner(overviewAreaHeight)
      overviewXAxis.tickPadding(5 - overviewAreaHeight)
      const detailAreaHeight = height - overviewArea.top - overviewArea.bottom
      detailXAxis.tickSizeInner(detailAreaHeight)
      detailXAxis.tickPadding(5 - detailAreaHeight)

      timelineOverview.select('.brush')
        .call(brush.extent([[0, 0], [width, overviewAreaHeight]]))

      zoom
        .translateExtent([[0, 0], [width, height]])
        .extent([[0, 0], [width, height]])
      timelineDetail.select('.zoom').attr('width', width)
      timelineDetail.select('.zoom').attr('height', detailAreaHeight)

      timelineOverview.select('.axis').call(overviewXAxis)
      timelineDetail.select('.axis').call(detailXAxis)

      render()
    }
  },

  _render () {
    log('_render')
    const data = this.data
    const proporstionData = this.proporstionData
    if (!this.detailArea || !this.overviewElement) {
      return
    }

    this.overviewElement.render()

    const {overviewArea, detailArea, overviewActivity} = this
    const {color, svg} = this
    var {y: overviewAreaY, x: overviewAreaX} = this.overviewArea
    var {x: detailAreaX} = this.detailArea

    const minmaxdomain = d3.extent([]
      .concat(d3.extent(data, (d) => d.timestamp))
      .concat(d3.extent(data, (d) => d.timestamp + (d.duration || 1)))
    )

    overviewAreaX.domain(minmaxdomain)
    overviewAreaY.domain([Math.max(d3.max(data, (d) => d.depth), 20), 0])
    detailAreaX.domain(minmaxdomain)

    svg.select('.timeline-overview').selectAll('.axis--x').call(overviewArea.xAxis)
    svg.select('.timeline-details').selectAll('.axis--x').call(detailArea.xAxis)

    var stack = d3.stack()
    .keys(LIKECYCLE_HOOKS)
    .order(d3.stackOrderNone)
    .offset(d3.stackOffsetNone)

    var series = stack(proporstionData)

    var area = d3.area()
    .x(function (d) { return overviewAreaX(d.data.timestamp) })
    .y0(function (d) { return overviewAreaY(d[0]) })
    .y1(function (d) { return overviewAreaY(d[1]) })
    .curve(d3.curveMonotoneX)

    var paths = overviewActivity.selectAll('path')
      .data(series)

    paths.exit().remove()
    paths.enter().append('path')
      .merge(paths)
      .attr('d', area)
      .style('fill', (d, i) => d3.rgb(color(i)).brighter(1.5))

    //

    this._renderBlocks()
  },

  _renderBlocks () {
    log('_renderBlocks')
    const {color, tooltip, detailArea: {x}} = this
    const minX = x.domain()[0]

    var selection = this.rectangles
      .selectAll('.block')
      .data(this.data)
    selection.exit().remove()
    var newBlock = selection
    .enter()
      .append('g')
      .attr('class', 'block')

    newBlock
      .merge(selection)
      .attr('transform', (d, i) => `translate(${x(d.timestamp)}, ${d.depth * itemHeight})`)

    selection.selectAll('rect')
      .attr('width', (d) => x(minX + (d.duration || 1)))

    newBlock
    .append('rect')
      .attr('fill', (d, i) => d3.rgb(color(d.type)).brighter(1.5))
      .attr('height', (d) => itemHeight)
      .attr('width', (d) => x(minX + (d.duration || 1)))
      .on('mouseover', () => tooltip.style('visibility', 'visible'))
      .on('mousemove', (d) => tooltip
        .style('left', `${d3.event.pageX + 10}px`)
        .style('top', `${d3.event.pageY + 10}px`)
        .text(`${(d.duration || 0).toFixed(2)} ms - ${d.type} @ ${d.targetName}`)
      )
      .on('mouseout', () => tooltip.style('visibility', 'hidden'))

    newBlock
    .append('foreignObject')
      .attr('height', (d) => itemHeight)
      .attr('width', (d) => x(minX + (d.duration || 1)))
    .append('xhtml:div')
      .attr('class', 'label')
      .style('display', (d) => (x(minX + (d.duration || 1)) < minimalMilliscondToDisplayText) ? 'none' : 'block')
      .attr('fill', '#000')
      .text((d) => `${d.type} @ ${d.targetName}`)

    selection.selectAll('foreignObject')
      .attr('width', (d) => x(minX + (d.duration || 1)))
    selection.selectAll('.label')
      .style('display', (d) => (x(minX + (d.duration || 1)) < minimalMilliscondToDisplayText) ? 'none' : 'block')
      .attr('fill', '#000')
      .text((d) => `${d.type} @ ${d.targetName}`)
  }

  //
})

//

export const GraphComponent = [
  RootSvgGraphComponent
]

//
