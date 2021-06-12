import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-demo3',
  templateUrl: './demo3.component.html',
  styleUrls: ['./demo3.component.scss']
})
export class Demo3Component implements OnInit {

  public data1: GeoJSON.FeatureCollection;

  constructor() {
    this.data1 = {
      type: 'FeatureCollection',
      bbox: [127.7025, 43.2203, 142.8635, 26.1202],
      features: [
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [
                  32.607421875,
                  50.401515322782366
                ],
                [
                  49.04296875,
                  50.401515322782366
                ],
                [
                  49.04296875,
                  60.19615576604439
                ],
                [
                  32.607421875,
                  60.19615576604439
                ],
                [
                  32.607421875,
                  50.401515322782366
                ]
              ]
            ]
          }
        },
        {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [
                  139.65352535247803,
                  35.73602758811581
                ],
                [
                  139.65657234191895,
                  35.73602758811581
                ],
                [
                  139.65657234191895,
                  35.73752548290835
                ],
                [
                  139.65352535247803,
                  35.73752548290835
                ],
                [
                  139.65352535247803,
                  35.73602758811581
                ]
              ]
            ]
          }
        }
      ]
    };
  }

  ngOnInit(): void {
  }

}
