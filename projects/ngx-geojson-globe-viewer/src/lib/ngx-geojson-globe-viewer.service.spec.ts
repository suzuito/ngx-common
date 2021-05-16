import { TestBed } from '@angular/core/testing';

import { NgxGeojsonGlobeViewerService } from './ngx-geojson-globe-viewer.service';

describe('NgxGeojsonGlobeViewerService', () => {
  let service: NgxGeojsonGlobeViewerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NgxGeojsonGlobeViewerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
