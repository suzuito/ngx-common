import { AfterViewInit, Component, ElementRef, Input, OnChanges, OnDestroy, OnInit, SimpleChange, SimpleChanges, ViewChild } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'lib-ngx-geojson-globe-viewer',
  templateUrl: './ngx-geojson-globe-viewer.component.html',
  styleUrls: ['./ngx-geojson-globe-viewer.component.scss'],
})
export class NgxGeojsonGlobeViewerComponent implements OnInit, AfterViewInit, OnDestroy, OnChanges {

  @ViewChild('main')
  private elMain: ElementRef<SVGSVGElement> | undefined;

  @Input()
  public edgeLength: number;

  @Input()
  public data: GeoJSON.FeatureCollection;

  public width: number;
  public height: number;

  private svg: SVGSVGElement | undefined;
  private ssvgInternal: d3.Selection<any, any, any, any> | undefined;
  public path: d3.GeoPath;

  private projection: d3.GeoProjection;
  public projectionScale: number;

  @ViewChild('pathGraticule')
  private elPathGraticule: ElementRef<SVGPathElement> | undefined;
  private svgPathGraticule: SVGPathElement | undefined;
  private geojsonGraticule: GeoJSON.MultiLineString;

  @ViewChild('pathLand1')
  private elPathLand1: ElementRef<SVGPathElement> | undefined;
  private svgPathLand1: SVGPathElement | undefined;
  private geojsonLand1: GeoJSON.FeatureCollection;

  @ViewChild('pathData')
  private elPathData: ElementRef<SVGPathElement> | undefined;
  private svgPathData: SVGPathElement | undefined;

  constructor() {
    this.edgeLength = 300;
    this.width = 300;
    this.height = 300;

    this.projection = d3.geoOrthographic();
    // this.projection = d3.geoMercator();
    this.projection.precision(0.1);
    this.projectionScale = 10;

    this.geojsonGraticule = d3.geoGraticule10();
    this.path = d3.geoPath(this.projection);

    this.geojsonLand1 = { type: 'FeatureCollection', features: [] };

    this.data = { type: 'FeatureCollection', features: [] };
  }

  ngOnInit(): void {
    d3.json('https://raw.githubusercontent.com/suzuito/ngx-common/feature/d3-geo/countries.json').then(
      (d: unknown) => {
        this.geojsonLand1 = d as GeoJSON.FeatureCollection;
        this.redisplay();
      },
    );
  }

  ngOnDestroy(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.edgeLength) {
      this.width = changes.edgeLength.currentValue;
      this.height = changes.edgeLength.currentValue;
      this.projection.fitSize([this.width, this.height], { type: 'Sphere' });
      this.redisplay();
      return;
    }
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
    if (!this.elPathData) {
      console.error(`elPathData is undefined`);
      return;
    }
    this.svg = this.elMain.nativeElement;
    this.svg.setAttribute('width', `${this.width}`);
    this.svg.setAttribute('height', `${this.height}`);
    this.ssvgInternal = d3.select(this.svg);

    this.svgPathGraticule = this.elPathGraticule.nativeElement;
    this.svgPathLand1 = this.elPathLand1.nativeElement;
    this.svgPathData = this.elPathData.nativeElement;
  }

  get ssvg(): d3.Selection<any, any, any, any> {
    if (!this.ssvgInternal) {
      throw new Error(`ssvgInternal is undefined`);
    }
    return this.ssvgInternal;
  }

  private redisplay(): void {
    if (!this.svgPathGraticule) {
      console.error(`svgPathGraticule is undefined`);
      return;
    }
    if (!this.svgPathLand1) {
      console.error('svgPathLand1 is undefined');
      return;
    }
    if (!this.svgPathData) {
      console.error(`svgPathData is undefined`);
      return;
    }

    this.svgPathGraticule.setAttribute('d', this.path(this.geojsonGraticule) as any);
    this.svgPathLand1.setAttribute('d', this.path(this.geojsonLand1) as any);
    this.svgPathData.setAttribute('d', this.path(this.data) as any);
  }

  clickSVG(v: MouseEvent): void {
    if (this.projection.invert) {
      const target = this.projection.invert([v.offsetX, v.offsetY]);
      const center = this.projection.invert([this.width / 2, this.height / 2]);
      if (target && center) {
        const currentRotate = this.projection.rotate();
        this.projection.rotate([
          currentRotate[0] + (center[0] - target[0]),
          currentRotate[1] + (center[1] - target[1]),
        ]);
        this.redisplay();
      }
    }
  }

  inputScale(event: InputEvent): void {
    this.projectionScale = (event.target as any).value;
    this.projection.scale(this.projectionScale);
    this.redisplay();
  }
}

