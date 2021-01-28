import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Cursor, CursorStoreService, MugenScroll, OrderedDataStoreIdxService } from 'ngx-mugen-scroll';
import { Data } from '../data';
import { DataProviderImplAsc } from '../data-provider';

@Component({
  selector: 'app-demo1',
  templateUrl: './demo1.component.html',
  styleUrls: ['./demo1.component.scss']
})
export class Demo1Component extends MugenScroll<Data> implements OnInit, AfterViewInit {

  @ViewChild('parent')
  public elParent: ElementRef | undefined;

  @ViewChild('top')
  public elTop: ElementRef | undefined;

  @ViewChild('bottom')
  public elBottom: ElementRef | undefined;

  constructor(
    base: OrderedDataStoreIdxService,
    cursorStore: CursorStoreService,
  ) {
    super(
      (v: Data) => new Cursor([v.createdAt, v.name]),
      new DataProviderImplAsc(base),
      cursorStore,
      {
        waitTimeMilliSeconds: 500,
        fetchLength: 100,
        maxLength: 200,
        threshold: 0.5,
      },
    );
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (!this.elParent) {
      console.error(`elParent is undefined`);
      return;
    }
    if (!this.elBottom) {
      console.error(`elBottom is undefined`);
      return;
    }
    if (!this.elTop) {
      console.error(`elTop is undefined`);
      return;
    }
    this.initElements({
      elParent: this.elParent.nativeElement,
      elBottom: this.elBottom.nativeElement,
      elTop: this.elTop.nativeElement,
    });
    this.initEdgeDetector();
    this.load('demo1', { initScrollBottom: false, });
  }

  async onBottom(): Promise<void> {
    await this.fetchBottom();
  }

  async onTop(): Promise<void> {
    await this.fetchTop();
  }
}
