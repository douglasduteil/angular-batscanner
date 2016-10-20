//

import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  ViewChild,
  ViewEncapsulation
} from '@angular/core'

import {LifecycleHooksColors} from './lifecycle_hooks_colors.js'
import {
  axisTicks,
  polylinearRangeFromDomains
} from './graph_util.js'

import * as d3 from 'd3'

//

const itemHeight = 20
const minimalMilliscondToDisplayText = 30

//

export const FlamechartComponent =
Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  exportAs: 'bdFlamechart',
  host: {
  },
  inputs: [
    'data',
    'transform',
    'height',
    'width'
  ],
  outputs: [
    'zoomEmitter: zoom'
  ],
  queries: {
    flameGroupElement: new ViewChild('flameGroup'),
    axisElement: new ViewChild('axis'),
    zoomElement: new ViewChild('zoom')
  },
  selector: 'g[bd-flamechart]',
  styles: [`
    .zoom {
      cursor: move;
      fill: none;
      pointer-events: all;
    }

    .flame-group /deep/ rect {
      stroke: #EEEEEE;
      fill-opacity: .8;
    }

    .flame-group /deep/ rect:hover {
      stroke: #474747;
      stroke-width: 0.5;
    }

    .flame-group /deep/ .label {
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
  template: `
    <svg:g
     #axis
     class="axis axis--x"
    ></svg:g>
    <svg:rect
     #zoom
     class="zoom"
    ></svg:rect>
    <svg:g
     #flameGroup
     class="flame-group"
     transform='translate(0, 20)'
    ></svg:g>
  `
})
.Class({
  constructor: [function FlamechartComponent () {
    this.zoomEmitter = new EventEmitter() // .debounceTime(150)
    this.series = []
    this.seriesDomains = []
    this.axisDomain = []

    this.color = (type) => LifecycleHooksColors[type]
  }],

  ngAfterViewInit () {
    this.initialize()
  },

  ngOnChanges (changes) {
    if (changes.data && this.data) {
      const overviewComponentUpdate = () => this.update(this.data)
      window.requestIdleCallback(overviewComponentUpdate)
    }

    const overviewComponentUpdateViewModel = () => this.updateViewModel()
    window.requestIdleCallback(overviewComponentUpdateViewModel)
  },

  ngAfterViewChecked () {
    const flamechartComponentRenderFrame = () => { this.render() }
    const flamechartComponentAskForRenderFrame = () => {
      // Scheduling the next render function after the last idle "frame"
      window.requestAnimationFrame(flamechartComponentRenderFrame)
    }
    window.requestIdleCallback(flamechartComponentAskForRenderFrame)
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

  //

  initialize () {
    this.x = d3.scaleLinear()
      .domain([0, 1000])
      .range([0, this.width])

    //

    this.xAxis = d3.axisBottom(this.x)
      .tickFormat((p) => d3.format('d')(p) + ' ms')
      .tickSizeInner(this.height)
      .tickPadding(5 - this.height)

    //

    this.zoom = d3.zoom()
      .scaleExtent([1, Infinity])
      .translateExtent([[0, 0], [this.width, this.height]])
      .extent([[0, 0], [this.width, this.height]])
      .on('zoom', this._zoomed.bind(this))
  },

  flames (context) {
    const selection = context.selection ? context.selection() : context
    const sizeX = (d) => this.x(d.timestamp + (d.duration || 1)) - this.x(d.timestamp)

    const tooltip = d3.select(this.tooltipElement.nativeElement)

    const flame = selection.selectAll('.flame')
      .data(this.series)
    const flameExit = flame.exit()
    const flameEnter = flame.enter()
      .append('g')
      .attr('class', 'flame')
      .on('mouseover', () => tooltip.style('visibility', 'visible'))
      .on('mousemove', (d) => tooltip
        .style('left', `${d3.event.pageX + 10}px`)
        .style('top', `${d3.event.pageY}px`)
        .text(`${(d.duration || 0).toFixed(2)} ms - ${d.type} @ ${d.targetName}`)
      )
      .on('mouseout', () => tooltip.style('visibility', 'hidden'))

    flameEnter.merge(flame)
      .attr('transform', (d, i) =>
        `translate(${this.x(d.timestamp)}, ${d.depth * itemHeight})`
      )

    flameExit.remove()

    //

    const rect = flame.select('rect')
    const rectEnter = flameEnter.append('rect')

    rectEnter.merge(rect)
      .attr('height', (d) => itemHeight)
      .attr('width', (d) => sizeX(d))
      .attr('fill', (d, i) => this.color(d.type))

    //

    const foreignObject = flame.select('foreignObject')
    const foreignObjectEnter = flameEnter
      .append('foreignObject')

    foreignObjectEnter.merge(foreignObject)
      .attr('height', (d) => itemHeight)
      .attr('width', (d) => sizeX(d))

    //

    const label = foreignObject.select('.label')
    const lableEnter = foreignObjectEnter
      .append('xhtml:div')
      .attr('class', 'label')

    lableEnter.merge(label)
      .style('display', (d) => (
        sizeX(d) < minimalMilliscondToDisplayText
        ? 'none' : 'block'
      ))
      .attr('fill', '#000')
      .text((d) => `${d.type} @ ${d.targetName}`)
  },

  render () {
    d3.select(this.flameGroupElement.nativeElement)
      .call(this.flames.bind(this))

    d3.select(this.zoomElement.nativeElement)
      .attr('width', this.width)
      .attr('height', this.height)
      .call(this.zoom)

    d3.select(this.axisElement.nativeElement)
      .call(this.xAxis)
      .selectAll('text')
        .attr('x', '-5')
  },

  update (data) {
    const lastEvent = data[data.length - 1] || {}
    this.startTime = this.startTime || (data[0] || {}).timestamp
    this.endTime = lastEvent.timestamp + lastEvent.duration

    const dataExtent = [(data[0] || {}).timestamp, this.endTime]
    this.seriesDomains.push(dataExtent)

    this.axisDomain = this.axisDomain.concat(
      d3.extent(dataExtent)
    )

    const IdDepthMap = data.reduce((memo, e) => {
      if (Number.isNaN(Number(memo[e.id]))) {
        memo[e.id] = memo.length
        memo.length += 1
      }
      return memo
    }, {length: 0})

    const getDepthFromId = (id) => IdDepthMap[id]
    const newSerie = data.map((e) => {
      return Object.assign({}, e, {
        depth: getDepthFromId(e.id)
      })
    })

    //

    this.series = this.series.concat(newSerie)
  },

  updateViewModel () {
    const axisRange = polylinearRangeFromDomains({
      domains: this.seriesDomains,
      range: [0, this.width]
    })

    this.x.domain(this.axisDomain)
      .range(axisRange)

    const tickValues = axisTicks({
      domains: this.seriesDomains,
      x: this.x
    })

    this.xAxis.tickValues(tickValues)
  },

  //

  _zoomed () {
    if (d3.event.sourceEvent && d3.event.sourceEvent.type === 'brush') {
      return // ignore zoom-by-brush
    }

    this.zoomEmitter.next(d3.event)
  }
})
