import { ElementRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MugenScrollBottomDirective } from './mugen-scroll-bottom.directive';

class MockElementRef extends ElementRef {
  constructor() {
    super(document.createElement('div'));
  }
}

describe('MugenScrollBottomDirective', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        { provide: ElementRef, useClass: MockElementRef }
      ]
    }).compileComponents();
  });

  it('should create an instance', () => {
    const el = TestBed.inject(ElementRef);
    const dir = new MugenScrollBottomDirective(el);
    expect(dir.element).toBeInstanceOf(HTMLDivElement);
  });
});
