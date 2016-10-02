//

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Renderer,
  ViewEncapsulation
} from '@angular/core'

/* eslint-disable import/default */
import iconCancel from '../../icons/ic_do_not_disturb_black_24px.svg'
import iconRecord from '../../icons/ic_fiber_manual_record_black_24px.svg'
/* eslint-enable import/default */

//

const ICONS = {
  cancel: iconCancel,
  record: iconRecord
}

//

export const IconComponent =
Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  inputs: ['svgIcon'],
  host: {
    'role': 'img'
  },
  selector: 'bd-icon',
  styles: [`
  bd-icon {
    display: flex;
    height: 17px;
  }

  bd-icon svg {
    flex: 1;
    width: auto;
    height: auto;
  }
  `],
  template: `
  `
})
.Class({
  constructor: [ElementRef, function IconButtonComponent (element) {
    this._element = element
  }],

  ngOnChanges (changes) {
    const { svgIcon } = changes
    if (svgIcon) {
      this._element.nativeElement.innerHTML = ICONS[this.svgIcon] || ''
    }
  }
})
