//

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  ViewChild,
  ViewEncapsulation
} from '@angular/core'

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
const log = console.log.bind(null, '%cOverviewBrushComponent%c#', 'color: #2980b9', 'color: #333')

//

export const OverviewBrushComponent =
Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'bdOverviewBrush',
  host: {
  },
  inputs: [
    'data',
    'transform',
    'height',
    'width'
  ],
  outputs: [
    'brushed'
  ],
  queries: {
    areaElement: new ViewChild('area'),
    axisElement: new ViewChild('axis'),
    brushElement: new ViewChild('brush')
  },
  selector: 'g[bd-overview-brush]',
  template: `
  <svg:g
   #area
   class="area">
  ></svg:g>
  <svg:g
   #axis
   class="axis axis--x">
  ></svg:g>
  <svg:g
   #brush
   class="brush">
  ></svg:g>
  `
})
.Class({
  constructor: [function OverviewBrushComponent () {
    log('new')

    this.brushed = (new EventEmitter()).debounceTime(150)
    this.series = []
    this.stack = d3.stack()
      .keys(LIKECYCLE_HOOKS)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetNone)

    this.color = d3.scaleOrdinal(d3.schemeCategory10)
  }],

  ngOnChanges (changes) {
    log('ngOnChanges')
    log(Object.assign({}, this))

    if (changes.width && this.x) {
      this.x.range([0, this.width])
    }

    if (changes.data && this.area && this.data) {
      this.startTime = this.startTime || (this.data[0] || {}).timestamp
      this.endTime = (this.data[this.data.length - 1] || {}).timestamp

      const proporstionData = []
      calculateEventProportion(this.data, this.startTime, proporstionData)

      this.series = this.series.concat(this.stack(proporstionData))
    }
  },

  ngOnInit () {
    log('ngOnInit')
  },

  ngAfterViewInit () {
    log('ngAfterViewInit')

    this.initialize()
  },

  ngAfterViewChecked () {
    log('ngAfterViewChecked')
    this.render()
  },
  //

  initialize () {
    log('initialize')

    this.x = d3.scaleLinear()
      .domain([0, 1000])
      .range([0, this.width])

    this.y = d3.scaleLinear()
      .domain([1, 0])
      .range([0, this.height])
      .clamp(true)

    //

    this.xAxis = d3.axisBottom(this.x)
      .tickFormat((p) => d3.format('d')(p) + ' ms')
      .tickSizeInner(this.height)
      .tickPadding(5 - this.height)

    //

    this.brush = d3.brushX()
      .extent([[0, 0], [this.width, this.height]])
      .on('brush end', this._brushed.bind(this))

    this.area = d3.area()
      .x((d) => this.x(d.data.timestamp))
      .y0((d) => this.y(d[0]))
      .y1((d) => this.y(d[1]))
      .curve(d3.curveMonotoneX)
  },

  render () {
    log('render')

    const minmaxdomain = d3.extent([this.startTime, this.endTime])
    this.x.domain(minmaxdomain)
    this.y.domain([10, 0])

/*
    var paths = overviewActivity.selectAll('path')
      .data(series)

    paths.exit().remove()
    paths.enter().append('path')
      .merge(paths)
      .attr('d', area)
      .style('fill', (d, i) => d3.rgb(color(i)).brighter(1.5))
*/
    d3.select(this.areaElement.nativeElement).call((context) => {
      const selection = context.selection ? context.selection() : context
      const path = selection.selectAll('path').data(this.series)
      const pathExit = path.exit()
      const pathEnter = path.enter().append('path')

      path.merge(pathEnter)
        .attr('d', this.area)
        .style('fill', (d, i) => d3.rgb(this.color(i)).brighter(1.5))
      pathExit.remove()
    })
    d3.select(this.axisElement.nativeElement).call(this.xAxis)
    d3.select(this.brushElement.nativeElement).call(this.brush)
  },

  //

  _brushed () {
    log('_brushed')

    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') return // ignore brush-by-zoom

    this.brushed.next(d3.event)
  }
})

//

function calculateEventProportion (data, relativeTime, proportionsDataOutput) {
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

      proportionsDataOutput.push(
        LIKECYCLE_HOOKS.reduce(
          (memo, val) => Object.assign(memo, {[val]: 0}),
          { timestamp: Math.max(0, startTimestamp) }
        )
      )

      proportionsDataOutput.push(Object.assign({}, proportions, {
        timestamp: startTimestamp + ((endTimestamp - startTimestamp) / 2)
      }))

      proportionsDataOutput.push(
        LIKECYCLE_HOOKS.reduce(
          (memo, val) => Object.assign(memo, {[val]: 0}),
          { timestamp: endTimestamp }
        )
      )
    })
}






























































export const OOverviewBrushComponent =
Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  exportAs: 'bdOverviewBrush',
  host: {
  },
  inputs: [
    'transform',
    'height',
    'width'
  ],
  queries: {
    axisElement: new ViewChild('axis')
  },
  selector: 'g[bd-overview-brush]',
  template: `
  <svg:g
   #axis
   class="axis axis--x">
   width : {{ width }}
  ></svg:g>
  `
})
.Class({
  constructor: [ElementRef, function OOverviewBrushComponent (elementRef) {
    log('new')
    this._element = elementRef.nativeElement

    this._isInitialized = false

    this.group = d3.select(this._element.nativeElement)
    this.transform = `translate(0, 0)`
  }],

  ngOnChanges (changes) {
    log('ngOnChanges')
    console.log('ngChanges', changes, this)
  },

  ngAfterViewChecked () {
    log('ngAfterViewChecked')
    if (!this._isInitialized) {
      this.initialize()
      return
    }
    this.render()
  },

  //

  _initializedView () {
    return [
      this._hasVitalInfo(),
      //
      this.axisElement,
      this.x,
      this.xAxis
    ].every(Boolean)
  },

  _hasVitalInfo () {
    return [
      this.width,
      this.height
    ].every(Boolean)
  },

  //

  initialize () {
    console.log('initialize')
    if (!this._hasVitalInfo()) {
      return
    }

    this.x = d3.scaleLinear()
      .domain([0, 1000])
      .range([0, this.width])

    this.xAxis = d3.axisBottom(this.x)
      .tickFormat((p) => d3.format('d')(p) + ' ms')
      .tickSizeInner(this.height)
      .tickPadding(5 - this.height)

    this._isInitialized = true
    console.log('initialized')
  },

  render () {
    console.log('render')
    if (!this._initializedView()) {
      return
    }

    console.log('rendered')
  }
})
