import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[libMugenScrollBottom]'
})
export class MugenScrollBottomDirective {

  /**
   * @ignore
   */
  constructor(
    private el: ElementRef,
  ) { }

  /**
   * @ignore
   */
  get element(): HTMLElement {
    return this.el.nativeElement;
  }
}
