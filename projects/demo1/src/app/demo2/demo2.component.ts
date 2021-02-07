import { Component, OnInit, ViewChild } from '@angular/core';
import { NgxMugenScrollComponent, OrderedDataStoreIdxService } from 'ngx-mugen-scroll';
import { Data } from '../data';
import { DataProviderImplAsc } from '../data-provider';
import { Group } from '../group';
import { GroupProviderServiceImplDesc } from '../group-provider.service';

@Component({
  selector: 'app-demo2',
  templateUrl: './demo2.component.html',
  styleUrls: ['./demo2.component.scss']
})
export class Demo2Component implements OnInit {

  public groupProvider: GroupProviderServiceImplDesc;
  public dataProvider: DataProviderImplAsc;

  @ViewChild('dataMugenScroll')
  public dataMugenScroll: NgxMugenScrollComponent | undefined;

  constructor(
    base: OrderedDataStoreIdxService,
  ) {
    this.groupProvider = new GroupProviderServiceImplDesc(base);
    this.dataProvider = new DataProviderImplAsc(base);
  }

  ngOnInit(): void {
  }

  clickGroup(group: Group): void {
    if (this.dataMugenScroll === undefined) {
      throw new Error('dataMugenScroll component is not found');
    }
    console.log(group);
    this.dataMugenScroll.saveScrollPosition();
    this.dataProvider.currentGroupId = group.id;
    this.dataMugenScroll.init();
  }

  clickData(data: Data): void {
    console.log(data);
  }

}
