//

import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation
} from '@angular/core'

import {Observable} from 'rxjs/Observable'
import {Subject} from 'rxjs/Subject'

//

export const DevtoolComponent =
Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Native,
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
  `],
  template: `
  <bd-navbar>
    <button
     (click)="toggleRecord()"
     class="btn-toolbar"
     [class.recording]="isRecording"
    >
      <bd-icon svgIcon="record"></bd-icon>
    </button>
  </bd-navbar>
  <bd-graph
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
        console.log('DevtoolComponent : listening to this.stateSource$')
        return this.stateSource$
      })
  },

  ngOnChanges (changes) {
    if (!this.isRecording) {
      return
    }
    console.log('DevtoolComponent#ngOnChanges', this.state)
    this.stateSource$.next(this.state)
  },

  toggleRecord () {
    this.isRecording = !this.isRecording

    if (this.isRecording) {
      this.graphState = []
    }

    this.closingNotifier$.next()
  }
})
