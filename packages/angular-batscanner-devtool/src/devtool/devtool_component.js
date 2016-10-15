//

import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation
} from '@angular/core'

import {Subject} from 'rxjs/Subject'

//

export const DevtoolComponent =
Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Emulated,
  inputs: ['state'],
  selector: 'batscanner-debugger',
  styles: [`
  :host {
    display: flex;
    flex-direction: column;
    position: relative;
  }

  bd-graph {
    flex: 1
  }

  :host /deep/ .axis {
    text-anchor: end
  }
  :host /deep/ .axis path,
  :host /deep/ .axis line {
    fill: none;
    stroke: rgba(90, 90, 90, .09);
    shape-rendering: crispEdges;
  }

  `],
  template: `
  <bd-navbar>
    <button
     (click)="toggleRecord()"
     class="btn-toolbar"
     [class.recording]="isRecording"
     title="Record"
    >
      <bd-icon svgIcon="record"></bd-icon>
    </button>
    <button
     (click)="clearRecording(graph)"
     class="btn-toolbar"
     title="Clear recording"
    >
      <bd-icon svgIcon="cancel"></bd-icon>
    </button>
  </bd-navbar>
  <bd-graph
   #graph="bdGraph"
   [state]="graphState$ | async"
  >
  </bd-graph>
  `
})
.Class({
  constructor: [function DevtoolComponent () {}],

  ngOnInit () {
    this.isRecording = true
    this.graphState = []

    this.stateSource$ = new Subject()
    this.closingNotifier$ = new Subject()

    /*
    this.graphState$ = this.closingNotifier$
      .startWith(null)
      .switchMap((e) => {
        return this.stateSource$
          .scan((memo, val) => {
            return memo.concat(val)//.concat([null])
          }, [])
          .do((latest) => { this.graphState = latest })
          .startWith(this.graphState)
      })
    */

    this.graphState$ = this.closingNotifier$
      .startWith(null)
      .switchMap((e) => {
        // console.log('DevtoolComponent : listening to this.stateSource$')
        return this.stateSource$
      })
  },

  ngOnChanges (changes) {
    if (!this.isRecording) {
      return
    }
    // console.log('DevtoolComponent#ngOnChanges', this.state)
    this.stateSource$.next(this.state)
  },

  //

  clearRecording (graph) {
    graph.data = []
    graph.proporstionData = []
    graph._render()
  },

  toggleRecord () {
    this.isRecording = !this.isRecording

    if (this.isRecording) {
      this.graphState = []
    }

    this.closingNotifier$.next()
  }
})
