import { Component, OnInit, ViewChild } from '@angular/core';
import { OrderedDataStoreIdxService, ScrollBottomEvent, ScrollTopEvent } from 'ngx-mugen-scroll';
import { GroupProviderServiceImplDesc } from '../group-provider.service';

@Component({
  selector: 'app-demo2',
  templateUrl: './demo2.component.html',
  styleUrls: ['./demo2.component.scss']
})
export class Demo2Component implements OnInit {

  public groupProvider: GroupProviderServiceImplDesc;

  constructor(
    base: OrderedDataStoreIdxService,
  ) {
    this.groupProvider = new GroupProviderServiceImplDesc(base);
  }

  ngOnInit(): void {
  }

  groupOnBottom(ev: ScrollBottomEvent): void {
    console.log(ev);
  }
  groupOnTop(ev: ScrollTopEvent): void {
    console.log(ev);
  }

}
