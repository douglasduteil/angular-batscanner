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
    svgElement: new ViewChild('mySvg')
  },
  template: `
  <svg
   #mySvg
   xmlns="http://www.w3.org/2000/svg"
   version="1.1"
  ></svg>
  `
})
.Class({
  constructor: [ElementRef, function GraphComponent (elementRef) {
    this._element = elementRef.nativeElement
  }],

  ngAfterViewInit () {
    this._initializeGraph(this.svgElement.nativeElement)
  },

  ngOnChanges (changes) {
    if (changes.state) {
      this._update(this.state)
    }
  },

  //

  _initializeGraph (svgElement) {
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

    const x = d3.scaleLinear()
      .domain([0, 1000])
      .range([0, width])

    const y = d3.scaleLinear()
      .domain([0, 1000])
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

    viewport.append('circle')
      .attr('cx', svgElement.clientWidth / 2)
      .attr('cy', svgElement.clientHeight / 2)
      .attr('r', 50)
      .style('fill', '#B8DEE6')

    svg.call(zoom)
    return
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



    return
    this.width = this._element.clientWidth
    this.height = 400 //this._element.clientHeight
    console.log('ngInit', this.width, 'x', this.height)

    var scaleX = d3.scaleLinear()
      .domain([0, 5])
      .range([0, this.width])

    var scaleY = d3.scaleLinear()
      .domain([0, 5])
      .range([0, this.height])
    var axisBotton = d3.axisBottom(scaleX)
    var axis = d3.axisLeft(scaleY)

    this.svg = d3.select(svg)
      .attr('width', '100%')
      .attr('height', '100%')
      .call(d3.zoom().on('zoom', () => {
        this.svg.attr('transform', d3.event.transform)
      }))

    this.viewport = this.svg.append('g')
      .attr('class', 'viewport')

    this.viewport.append("g")
      .attr('class', 'x axis')
      .call(axisBotton)

    this.viewport.append("g")
      .attr('class', 'y axis')
      .call(axis)

    return
    this.axisScale = d3.scale.linear()
      .domain([0, 5])
      .range([0, this.width])

    var xxAxis = d3.svg.axis()
      .scale(this.axisScale)

    this.svg.append('g')
      .attr('class', 'x axis')
      .call(xAxis)

    this.timeline = this.svg.append('g')
  },

  _update (state) {
    if (state) {
      return
    }
  }
})

//
