import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[libMugenScrollTop]'
})
export class MugenScrollTopDirective {

  /**
   * @ignore
   */
  constructor(
    private el: ElementRef,
  ) {
  }

  /**
   * @ignore
   */
  get element(): HTMLElement {
    return this.el.nativeElement;
  }
}
