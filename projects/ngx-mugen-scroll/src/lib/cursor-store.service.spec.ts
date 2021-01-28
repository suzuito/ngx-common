import { TestBed } from '@angular/core/testing';

import { CursorStoreService } from './cursor-store.service';

describe('CursorStoreService', () => {
  let service: CursorStoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CursorStoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
