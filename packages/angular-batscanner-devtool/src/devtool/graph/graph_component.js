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

    const statee = data.map(function (e) {
      return Object.assign({}, e, {depth: depth(e.id)})
    })

    statee.forEach((e) => { this.data.push(e) })

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

    const svgWidth = svgElement.clientWidth
    const svgHeight = svgElement.clientHeight

    const width = svgWidth - margin.left - margin.right
    const height = svgHeight - margin.top - margin.bottom
    this.color = d3.scaleOrdinal(d3.schemeCategory10)

    //

    const x = this.x = d3.scaleLinear().domain([0, 1000]).range([0, width])
    const y = this.y = d3.scaleLinear().domain([0, 10]).range([0, height])
    const xAxis = this.xAxis = d3.axisBottom(x)
    const yAxis = this.yAxis = d3.axisLeft(y)

    svg.append('g')
    .attr('class', 'axis axis--x')
    .call(xAxis)

    svg.append('g')
    .attr('class', 'axis axis--y')
    .call(yAxis)

    this.flamechart = svg.append('g')
      .attr('class', 'flamechart')
      .attr('transform', 'translate(0, 50)')

    this.rectangles = svg.append('g')
      .attr('class', 'rectangles')
      .attr('transform', 'translate(0, 50)')
  },

  _render () {
    const data = this.data
    console.log('_render', data.slice(0))
    if (!this.rectangles) {
      return
    }
    const {color, flamechart, svg, x, xAxis, y, yAxis} = this
    const itemHeight = 50
    const textMargin = 5

    const minmaxdomain = d3.extent([]
      .concat(d3.extent(data, (d) => d.timestamp - 1000))
      .concat(d3.extent(data, (d) => d.timestamp + (d.duration || 1) + 1000))
    )
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
