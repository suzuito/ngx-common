import { TestBed } from '@angular/core/testing';

import { OrderedDataStoreIdxService } from './ordered-data-store-idx.service';

describe('OrderedDataStoreIdxService', () => {
  let service: OrderedDataStoreIdxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderedDataStoreIdxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
