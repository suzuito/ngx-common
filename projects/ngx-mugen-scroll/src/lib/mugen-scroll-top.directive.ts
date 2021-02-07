import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[libMugenScrollTop]'
})
export class MugenScrollTopDirective {

  constructor(
    private el: ElementRef,
  ) {
  }

  get element(): HTMLElement {
    return this.el.nativeElement;
  }
}
