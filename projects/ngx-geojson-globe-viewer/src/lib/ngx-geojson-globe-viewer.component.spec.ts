import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxGeojsonGlobeViewerComponent } from './ngx-geojson-globe-viewer.component';

describe('NgxGeojsonGlobeViewerComponent', () => {
  let component: NgxGeojsonGlobeViewerComponent;
  let fixture: ComponentFixture<NgxGeojsonGlobeViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxGeojsonGlobeViewerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NgxGeojsonGlobeViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
