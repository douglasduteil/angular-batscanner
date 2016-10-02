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
    color: #5a5a5a;
    height: 17px;
  }

  bd-icon img {
    height: 100%;
  }
  `],
  template: `
  <ng-content></ng-content>
  `
})
.Class({
  constructor: [ElementRef, Renderer, function IconButtonComponent (element, renderer) {
    this._element = element
    this._renderer = renderer
  }],

  ngOnChanges (changes) {
    const { svgIcon } = changes

    if (svgIcon) {
      this._setSvgElement(ICONS[this.svgIcon])
    }
  },

  _setSvgElement (svg) {
    if (!svg) {
      return
    }

    const layoutElement = this._element.nativeElement
    this._renderer.detachView(Array.from(layoutElement.childNodes))
    this._renderer.projectNodes(layoutElement, [svg])
  }
})
