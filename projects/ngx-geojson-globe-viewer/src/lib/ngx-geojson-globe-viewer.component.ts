import { AfterViewInit, Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'lib-ngx-geojson-globe-viewer',
  template: `
    <svg #main xmlns='http://www.w3.org/2000/svg'>
      <path #pathGraticule stroke="#ccc" fill="none"></path>
      <path #pathLand1 stroke="#ccc" fill="none"></path>
    </svg>
  `,
  styles: [
  ]
})
export class NgxGeojsonGlobeViewerComponent implements OnInit, AfterViewInit {

  @ViewChild('main')
  private elMain: ElementRef<SVGSVGElement> | undefined;

  @Input()
  public width: number;
  @Input()
  public height: number;

  private svg: SVGSVGElement | undefined;
  private ssvgInternal: d3.Selection<any, any, any, any> | undefined;
  public path: d3.GeoPath;

  private projection: d3.GeoProjection;

  @ViewChild('pathGraticule')
  private elPathGraticule: ElementRef<SVGPathElement> | undefined;
  private svgPathGraticule: SVGPathElement | undefined;
  private geojsonGraticule: GeoJSON.MultiLineString;

  @ViewChild('pathLand1')
  private elPathLand1: ElementRef<SVGPathElement> | undefined;
  private svgPathLand1: SVGPathElement | undefined;

  constructor() {
    this.width = 300;
    this.height = 300;

    this.projection = d3.geoOrthographic();
    this.projection.precision(0.1);

    this.geojsonGraticule = d3.geoGraticule10();
    this.path = d3.geoPath(this.projection);
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (!this.elMain) {
      console.error(`elMain is undefined`);
      return;
    }
    if (!this.elPathGraticule) {
      console.error(`elMain is undefined`);
      return;
    }
    if (!this.elPathLand1) {
      console.error(`elPathLand1 is undefined`);
      return;
    }
    this.svg = this.elMain.nativeElement;
    this.svg.setAttribute('width', `${this.width}`);
    this.svg.setAttribute('height', `${this.height}`);
    this.svg.style.border = '1px solid black';
    this.svg.style.boxSizing = 'border-box';
    this.ssvgInternal = d3.select(this.svg);

    this.svgPathGraticule = this.elPathGraticule.nativeElement;
    this.svgPathLand1 = this.elPathLand1.nativeElement;

    this.projection.fitWidth(this.width, { type: 'Sphere' });
    this.projection.fitHeight(this.height, { type: 'Sphere' });
    this.svgPathGraticule.setAttribute('d', this.path(this.geojsonGraticule) as any);
  }

  get ssvg(): d3.Selection<any, any, any, any> {
    if (!this.ssvgInternal) {
      throw new Error(`ssvgInternal is undefined`);
    }
    return this.ssvgInternal;
  }

}
