//

import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation
} from '@angular/core'

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
    <button class="btn-toolbar">
      <bd-icon svgIcon="record"></bd-icon>
    </button>
  </bd-navbar>
  <bd-graph
   [state]="graphState"
  >
  </bd-graph>
  `
})
.Class({
  constructor: function DevtoolComponent () {},
  ngOnChanges (changes) {
    this.graphState = this.state
  }
})
