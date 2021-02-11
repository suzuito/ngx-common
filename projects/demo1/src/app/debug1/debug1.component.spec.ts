import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Debug1Component } from './debug1.component';

describe('Debug1Component', () => {
  let component: Debug1Component;
  let fixture: ComponentFixture<Debug1Component>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Debug1Component ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Debug1Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
