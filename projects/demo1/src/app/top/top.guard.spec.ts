import { TestBed } from '@angular/core/testing';

import { TopGuard } from './top.guard';

describe('TopGuard', () => {
  let guard: TopGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(TopGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
