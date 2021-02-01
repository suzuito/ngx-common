import { TestBed } from '@angular/core/testing';

import { GroupProviderService } from './group-provider.service';

describe('GroupProviderService', () => {
  let service: GroupProviderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GroupProviderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
