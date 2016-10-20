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

import {axisTicks, polylinearRangeFromDomains} from './graph_util.js'

//

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

    .flame-chart-entry-info {
      z-index: 200;
      position: absolute;
      background-color: white;
      pointer-events: none;
      visibility: hidden;
      padding: 5px 10px;
      box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.05), 0 2px 4px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0, 0, 0, 0.1);
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
    const rootSvgGraphComponentReattachChangeDetector =
      () => { this._ref.reattach() }

    this.flamechart.tooltipElement = this.tooltipElement

    Observable.fromEvent(window, 'resize')
      .do(() => this._ref.detach())
      .debounceTime(100)
      .startWith(null)
      .subscribe(() => {
        this._resize()
        window.requestAnimationFrame(
          rootSvgGraphComponentReattachChangeDetector
        )
      })
  },

  ngOnDestroy () {
    // TOOD(@douglasduteil): remove resize listener
  },

  //

  clear () {
    this.flamechart.clear()
    this.overview.clear()
  },

  //

  _onOverviewBushed (event) {
    const s = event.selection || this.overview.x.range()

    this._updateFlamechartScale(s)

    const zoomTransform = d3.zoomIdentity
      .scale(this.svgWidth / (s[1] - s[0]))
      .translate(-s[0], 0)

    d3.select(this.flamechart.zoomElement.nativeElement)
      .call(this.flamechart.zoom.transform, zoomTransform)

    this.flamechart.render()
  },

  _onFlameChartZoom (event) {
    const t = event.transform
    const s = d3.extent(this.flamechart.x.range().map(t.invertX, t))

    this._updateFlamechartScale(s)

    this.flamechart.render()

    d3.select(this.overview.brushElement.nativeElement)
      .call(
        this.overview.brush.move,
        d3.extent(this.flamechart.x.range().map(t.invertX, t))
      )
  },

  _updateFlamechartScale (section) {
    const ascSort = (a, b) => a - b
    const [sdMin, sdMax] = section.map(this.overview.x.invert).sort(ascSort)

    if (sdMin === sdMax) {
      return
    }

    const sDomain = this.overview.seriesDomains
      .filter(([dMin, dMax]) => dMax >= sdMin && dMin <= sdMax)
      // HACK(@douglasduteil): make lil' deep copy here
      // The arrays inside this array will mutate to adjust the min and max
      // scale. So a copy on those arrays is required.
      .map((domain) => domain.slice(0))

    if (!sDomain.length) {
      return
    }

    // HACK(@douglasduteil): dangerous mutation
    // Took me 2 hours to find out how bad those two line of mutation are...
    // Might consider to trash them to avoid future problems...
    sDomain[0][0] = sdMin
    sDomain[sDomain.length - 1][1] = sdMax

    const axisRange = polylinearRangeFromDomains({
      domains: sDomain,
      range: [0, this.flamechart.width]
    })

    this.flamechart.x
      .domain(sDomain.reduce((memo, sub) => memo.concat(sub), []))
      .range(axisRange)

    //

    const tickValues = axisTicks({
      domains: this.flamechart.seriesDomains,
      x: this.flamechart.x
    })

    this.flamechart.xAxis.tickValues(tickValues)
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
