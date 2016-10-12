//

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation
} from '@angular/core'

import * as d3 from 'd3'

//

export const OverviewBrushComponent =
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
  constructor: [ElementRef, function OverviewBrushComponent (elementRef) {
    this._element = elementRef.nativeElement
    console.log('new OverviewBrushComponent')

    this._isInitialized = false

    this.group = d3.select(this._element.nativeElement)
    this.transform = `translate(0, 0)`
  }],

  ngOnChanges (changes) {
    console.log('ngChanges', changes, this)
  },

  ngAfterViewChecked () {
    console.log('ngAfterViewChecked ngAfterViewChecked', this)
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

    d3.select(this.axisElement.nativeElement).call(this.xAxis)
    console.log('rendered')
  }
})
