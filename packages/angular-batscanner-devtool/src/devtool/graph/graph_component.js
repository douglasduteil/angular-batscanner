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
      stroke-opacity: 0.3;
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
  <svg
   #mySvg
   xmlns="http://www.w3.org/2000/svg"
   version="1.1"
  ></svg>

  <div class="flame-chart-entry-info" #myTooltip>
  </div>
  `
})
.Class({
  constructor: [ElementRef, function GraphComponent (elementRef) {
    this._element = elementRef.nativeElement
  }],

  ngAfterViewInit () {
    this._initializeGraph(
      this.svgElement.nativeElement,
      this.tooltipElement.nativeElement
    )
  },

  ngOnChanges (changes) {
    if (changes.state) {
      this._update(this.state)
    }
  },

  //

  _initializeGraph (svgElement, tooltipElement) {
    if (!svgElement) {
      return
    }

    const svg = d3.select(svgElement)
    d3.select(window).on('resize', resize)
    const width = svgElement.clientWidth
    const height = svgElement.clientHeight

    const zoom = d3.zoom()
      .scaleExtent([1, 40])
      .translateExtent([[0, 0], [1000, height]])
      .on('zoom', zoomed)

    const x = this.axisScale = d3.scaleLinear()
      .domain([0, 1000])
      .range([0, width])

    const y = d3.scaleLinear()
      .domain([0, 100])
      .range([0, height])

    const xAxis = d3.axisBottom(x)
      .ticks(13)

    const yAxis = d3.axisRight(y)

    const viewport = svg.append('g')
        .attr('class', 'viewport')

    const gX = svg.append('g')
        .attr('class', 'axis axis--x')
        .call(xAxis)

    const gY = svg.append('g')
        .attr('class', 'axis axis--y')
        .call(yAxis)

    this._flames = viewport.append('g')
        .attr('class', 'flames')

    svg.call(zoom)

    //

    function zoomed () {
      viewport.attr('transform', d3.event.transform)
      gX.call(xAxis.scale(d3.event.transform.rescaleX(x)))
      gY.call(yAxis.scale(d3.event.transform.rescaleY(y)))
    }

    function resize () {
      const width = svgElement.clientWidth
      const height = svgElement.clientHeight

      x.range([0, width])
      y.range([0, height])

      xAxis
      .tickSize(height)
      .tickPadding(8 - height)

      yAxis
      .tickSize(width)
      .tickPadding(8 - width)

      gX.call(xAxis.scale(x))
      gY.call(yAxis.scale(y))
    }
  },

  _update (state) {
    if (!state || !this._flames) {
      return
    }


    const c10c = d3.scaleOrdinal(d3.schemeCategory10)
    const itemHeight = 20
    const textMargin = 5

    const startTime = d3.min(state, (d) => d.timestamp)
    const endTime = d3.max(state, (d) => d.timestamp)
    this.axisScale.domain([startTime - 2000, endTime + 2000])

    state = state.filter(function (e) {
      return e.endTime
    })
    console.log(state)

    const flames = this._flames.selectAll('rect')
      .data(state)

    var tooltip = d3.select(this.tooltipElement.nativeElement)
      .style('position', 'absolute')
      .style('z-index', '10')
      .style('visibility', 'hidden')
      .style('background-color', '#fff')
      .style('padding', '5px 10px')
      .text('')

    const bars = flames
      .enter()
      .append('g')
      .attr('class', 'timeline-path')
      .attr('transform', (d, i) => `translate(${this.axisScale(d.timestamp)}, ${getStackTextPosition(d)})`)
      .on('mouseover', () => tooltip.style('visibility', 'visible'))
      .on('mousemove', (d) => tooltip
        .style('left', `${d3.event.pageX + 10}px`)
        .style('top', `${d3.event.pageY + 10}px`)
        .text(`${d.type} @ ${d.targetName}`)
      )
      .on('mouseout', () => tooltip.style('visibility', 'hidden'))

    bars
      .append('rect')
      .attr('width', (d) => this.axisScale(d.endTime) - this.axisScale(d.startTime))
      .attr('height', itemHeight)
      .attr('fill', (d, i) => c10c(i))

      /*
      .style('stroke', '#fff')
      .style('stroke-width', 1)
      */

    bars
      .filter((d) => ((this.axisScale(d.endTime) - this.axisScale(d.startTime))) > 500)
      .append('text')
      .attr('x', (d) => textMargin)
      .attr('y', (d) => itemHeight * (2.25 / 3))
      .attr('fill', '#000')
      .text((d) => `${d.type} @ ${d.targetName}`)

    function getStackTextPosition (d) {
      return (itemHeight) * d.id + itemHeight * 0.75
    }
  }
})

//
