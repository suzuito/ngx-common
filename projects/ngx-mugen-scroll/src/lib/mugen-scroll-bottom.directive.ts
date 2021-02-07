import { Directive, ElementRef } from '@angular/core';

@Directive({
  selector: '[libMugenScrollBottom]'
})
export class MugenScrollBottomDirective {

  constructor(
    private el: ElementRef,
  ) { }

  get element(): HTMLElement {
    return this.el.nativeElement;
  }
}
