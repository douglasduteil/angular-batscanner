//

import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation
} from '@angular/core'

//

export const NavbarComponent =
Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.Native,
  selector: 'bd-navbar',
  styles: [`
  :host {
    display: flex;
    flex: none;
    align-items: center;

    border-bottom: 1px solid #dadada;
    position: relative;
    white-space: nowrap;
    height: 26px;
    overflow: hidden;
    z-index: 12;
  }

  button {
    white-space: nowrap;
    overflow: hidden;
    min-width: 28px;
    background: transparent;
    position: relative;
    display: flex;
    flex: none;
    align-items: center;
    justify-content: center;
    padding: 0;
    height: 26px;
    border: none;
    color: #5a5a5a;
    cursor: pointer;
  }

  button:hover {
    color: #333;
  }

  .recording {
    color: red;
  }
  .recording:hover {
    color: red;
  }

  `],
  template: `
  <ng-content></ng-content>
  `
})
.Class({constructor: function NavbarComponent () {}})
