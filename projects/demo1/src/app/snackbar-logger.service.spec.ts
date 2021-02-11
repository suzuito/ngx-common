import { TestBed } from '@angular/core/testing';

import { SnackbarLoggerService } from './snackbar-logger.service';

describe('SnackbarLoggerService', () => {
  let service: SnackbarLoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SnackbarLoggerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
