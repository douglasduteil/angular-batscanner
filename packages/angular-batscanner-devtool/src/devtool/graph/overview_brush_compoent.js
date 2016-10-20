//

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  ViewChild,
  ViewEncapsulation
} from '@angular/core'

import * as d3 from 'd3'

import {LifecycleHooksColors} from './lifecycle_hooks_colors.js'
import {polylinearRangeFromDomains} from './sdf.js'

//

const LIKECYCLE_HOOKS = [
  'ngPipeTransform',
  'OnChanges',
  'OnInit',
  'DoCheck',
  'AfterContentInit',
  'AfterContentChecked',
  'AfterViewInit',
  'AfterViewChecked',
  'OnDestroy'
]

const virginProportionEntry = LIKECYCLE_HOOKS
  .reduce((memo, val) => Object.assign(memo, {[val]: 0}), {})

const log = console.log.bind(null, '%cOverviewBrushComponent%c#', 'color: #2980b9', 'color: #333')

//

export const OverviewBrushComponent =
Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
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
    'brushEmitter: brushed'
  ],
  queries: {
    areaElement: new ViewChild('area'),
    axisElement: new ViewChild('axis'),
    brushElement: new ViewChild('brush')
  },
  selector: 'g[bd-overview-brush]',
  styles: [`
  `],
  template: `
    <svg:g
     #area
     class="area"
    ></svg:g>
    <svg:g
     #axis
     class="axis axis--x"
    ></svg:g>
    <svg:g
     #brush
     class="brush"
    ></svg:g>
  `
})
.Class({
  constructor: [function OverviewBrushComponent () {
    this.brushEmitter = new EventEmitter()// .debounceTime(50)
    this.series = []
    this.seriesDomains = []
    this.axisDomain = []

    this.stack = d3.stack()
      .keys(LIKECYCLE_HOOKS)
      .order(d3.stackOrderNone)
      .offset(d3.stackOffsetExpand)

    this.color = (type) => d3.rgb(LifecycleHooksColors[type])
  }],

  ngOnChanges (changes) {
    if (changes.width && this.x) {
      this.x.range([0, this.width])
    }

    if (changes.data && this.area && this.data) {
      this.update()
    }
  },

  ngAfterViewInit () {
    this.initialize()
  },

  ngAfterViewChecked () {
    const overviewComponentRenderFrame = () => { this.render() }
    window.requestIdleCallback(() => {
      // Scheduling the next render function after the last idle "frame"
      window.requestAnimationFrame(overviewComponentRenderFrame)
    })
  },

  //

  clear () {
    this.startTime = null
    this.endTime = null
    this.data = []
    this.series = []
    this.seriesDomains = []
    this.axisDomain = []
  },

  initialize () {
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
    const areaChart = (context) => {
      const selection = context.selection ? context.selection() : context
      const path = selection.selectAll('path').data(this.series)
      const pathExit = path.exit()
      const pathEnter = path.enter().append('path')

      path.merge(pathEnter)
        .attr('d', this.area)
        .style('fill', (d) => this.color(d.key))
      pathExit.remove()
    }
    d3.select(this.areaElement.nativeElement).call(areaChart)
    d3.select(this.axisElement.nativeElement).call(this.xAxis)
    d3.select(this.brushElement.nativeElement).call(this.brush)
  },

  update () {
    const lastEvent = this.data[this.data.length - 1] || {}
    this.startTime = this.startTime || (this.data[0] || {}).timestamp
    this.endTime = lastEvent.timestamp + lastEvent.duration

    const processAndAssignNewSerie = () => {
      const proporstionData = calculateEventProportion(
        this.data, this.startTime, proporstionData
      )

      const ascSort = (a, b) => a - b
      const dataExtent = [(this.data[0] || {}).timestamp, this.endTime].sort(ascSort)
      this.seriesDomains.push(dataExtent)

      const axisRange = polylinearRangeFromDomains({
        domains: this.seriesDomains,
        range: [0, this.width]
      })

      this.axisDomain = this.axisDomain.concat(
        d3.extent(dataExtent)
      )

      this.x.domain(this.axisDomain)
        .range(axisRange)

      this.series = this.series.concat(this.stack(proporstionData))
    }

    window.requestIdleCallback(processAndAssignNewSerie)
  },

  //

  _brushed () {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'zoom') {
      return // ignore brush-by-zoom
    }
    if (d3.event.type === 'end') {
      return // ignore brush-by-zoom end event
    }

    this.brushEmitter.next(d3.event)
  }
})

//

function calculateEventProportion (data, relativeTime, proportionsDataOutput) {
  const {eventStacks} = data.reduce(function (memo, event, index) {
    if (Number.isNaN(Number(memo.depthMap[event.id]))) {
      memo.depthMap[event.id] = memo.depthMap.maxDepth
      memo.depthMap.maxDepth += 1
    }

    const lastEventStack = (memo.eventStacks[index - 1] || {}).stack || []
    const eventStack = [].concat(lastEventStack)
    const lastEvent = eventStack[eventStack.length - 1] || {}
    const lastDepth = memo.depthMap[lastEvent.id] || -1
    const currentDepth = memo.depthMap[event.id] || 1

    const isFlatEvent = lastEvent.type === 'ngPipeTransform'

    if (currentDepth <= lastDepth || isFlatEvent) {
      eventStack.pop()
    }

    // HACK(douglasduteil): Double LOL-i-pop()
    // When going back to a parent event we have to remove the child and the
    // current parent state ( ಠ ಠ )
    if (currentDepth < lastDepth) {
      eventStack.pop()
    }

    eventStack.push(Object.assign({}, event, {
      depth: currentDepth
    }))

    const nextEvent = data[index + 1]
    const nextEventTimestamp = nextEvent ? nextEvent.timestamp : event.timestamp + event.duration
    const middleTimestampDuration = (nextEventTimestamp - event.timestamp) / 2

    memo.eventStacks.push({
      stack: eventStack,
      timestamp: event.timestamp + middleTimestampDuration
    })

    return memo
  }, {
    depthMap: {maxDepth: 1},
    eventStacks: []
  })

  const eventProportion = eventStacks.map(function (eventStack) {
    const proportions = calculateEventProportionIn(eventStack.stack)
    return Object.assign(
      {timestamp: eventStack.timestamp},
      proportions
    )
  })

  const startTimestamp = (data[0] || {}).timestamp
  const endTimestamp = (data[data.length - 1] || {}).timestamp

  eventProportion.unshift(Object.assign({}, virginProportionEntry, {
    timestamp: startTimestamp
  }))

  eventProportion.push(Object.assign({}, virginProportionEntry, {
    timestamp: endTimestamp + (data[data.length - 1].duration || 0)
  }))

  return eventProportion
}

function calculateEventProportionIn (collection) {
  let result
  window.Rx.Observable.from(collection)
    .groupBy((x) => x.type)
    .flatMap((obs) => obs.count().map((v) => ({ [obs.key]: v })))
    .reduce(
      (memo, group) => Object.assign(memo, group),
      Object.assign({}, virginProportionEntry)
    )
    .subscribe((proportions) => {
      result = proportions
    })

  return result
}
