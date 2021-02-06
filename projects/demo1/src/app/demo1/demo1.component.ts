import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Cursor, CursorStoreService, MugenScroll, OrderedDataStoreIdxService } from 'ngx-mugen-scroll';
import { Data } from '../data';
import { DataProviderImplAsc } from '../data-provider';
import { Group } from '../group';
import { GroupProviderServiceImplDesc } from '../group-provider.service';

@Component({
  selector: 'app-demo1',
  templateUrl: './demo1.component.html',
  styleUrls: ['./demo1.component.scss']
})
export class Demo1Component implements OnInit, AfterViewInit {

  @ViewChild('parentGroupList')
  public groupElParent: ElementRef | undefined;
  @ViewChild('topGroupList')
  public groupElTop: ElementRef | undefined;
  @ViewChild('bottomGroupList')
  public groupElBottom: ElementRef | undefined;
  public groupMugenScroll: MugenScroll<Group>;

  @ViewChild('parentDataList')
  public dataElParent: ElementRef | undefined;
  @ViewChild('topDataList')
  public dataElTop: ElementRef | undefined;
  @ViewChild('bottomDataList')
  public dataElBottom: ElementRef | undefined;
  public dataMugenScroll: MugenScroll<Data>;

  constructor(
    base: OrderedDataStoreIdxService,
    cursorStoreService: CursorStoreService,
  ) {
    this.groupMugenScroll = new MugenScroll<Group>(
      (v: Group) => new Cursor([v.id, v.name]),
      new GroupProviderServiceImplDesc(base),
      cursorStoreService,
    );
    this.groupMugenScroll.event.subscribe(ev => {
      if (ev.type === 'onTop') {
        this.groupMugenScroll.fetchTop();
      }
      if (ev.type === 'onBottom') {
        this.groupMugenScroll.fetchBottom();
      }
    });

    this.dataMugenScroll = new MugenScroll<Data>(
      (v: Data) => new Cursor([v.createdAt, v.id]),
      new DataProviderImplAsc(base),
      cursorStoreService,
    );
    this.dataMugenScroll.event.subscribe(ev => {
      if (ev.type === 'onTop') {
        this.dataMugenScroll.fetchTop();
      }
      if (ev.type === 'onBottom') {
        this.dataMugenScroll.fetchBottom();
      }
    });
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (!this.groupElParent) {
      console.error(`groupElParent is undefined`);
      return;
    }
    if (!this.groupElBottom) {
      console.error(`groupElBottom is undefined`);
      return;
    }
    if (!this.groupElTop) {
      console.error(`groupElTop is undefined`);
      return;
    }
    this.groupMugenScroll.initElements({
      elParent: this.groupElParent.nativeElement,
      elBottom: this.groupElBottom.nativeElement,
      elTop: this.groupElTop.nativeElement,
    });
    this.groupMugenScroll.initEdgeDetector();
    this.groupMugenScroll.load('demo1', { initScrollBottom: false, });

    if (!this.dataElParent) {
      console.error(`dataElParent is undefined`);
      return;
    }
    if (!this.dataElBottom) {
      console.error(`dataElBottom is undefined`);
      return;
    }
    if (!this.dataElTop) {
      console.error(`dataElTop is undefined`);
      return;
    }
    this.dataMugenScroll.initElements({
      elParent: this.dataElParent.nativeElement,
      elBottom: this.dataElBottom.nativeElement,
      elTop: this.dataElTop.nativeElement,
    });
    this.dataMugenScroll.initEdgeDetector();
  }

  async clickGroup(group: Group): Promise<void> {
    await this.dataMugenScroll.load(
      `group-${group.id}-${group.name}`,
      {
        initScrollBottom: true,
      },
    );
  }
}
