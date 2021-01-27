import { TestBed } from '@angular/core/testing';

import { NgxMugenScrollService } from './ngx-mugen-scroll.service';

describe('NgxMugenScrollService', () => {
  let service: NgxMugenScrollService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxMugenScrollService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
