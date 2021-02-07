import { AfterViewInit, Component, ContentChild, ElementRef, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MugenScrollTopDirective } from './mugen-scroll-top.directive';
import { MugenScrollBottomDirective } from './mugen-scroll-bottom.directive';
import { DataProvider, MugenScroll } from './mugen-scroll';
import { CursorStoreService } from './cursor-store.service';
import { MugenScrollDataDirective } from './mugen-scroll-data.directive';

export interface ScrollBottomEvent { }
export interface ScrollTopEvent { }

@Component({
  selector: 'lib-ngx-mugen-scroll',
  template: `
    <ng-content></ng-content>
  `,
  styles: [
  ]
})
export class NgxMugenScrollComponent implements OnInit, AfterViewInit {

  @ContentChild(MugenScrollBottomDirective)
  public bottomDirective: MugenScrollBottomDirective | undefined;

  @ContentChild(MugenScrollTopDirective)
  public topDirective: MugenScrollTopDirective | undefined;

  @ContentChild(MugenScrollDataDirective)
  public dataDirective: MugenScrollDataDirective | undefined;

  @Input()
  public provider: DataProvider<object> | undefined;

  @Input()
  public uniqId: string;

  @Input()
  public scrollBottomOnInit: boolean;

  @Input()
  public countPerLoad: number;

  @Input()
  public autoFetchingBottom: boolean;

  @Input()
  public autoFetchingTop: boolean;

  @Input()
  public autoLoadScrollPosition: boolean;

  @Output()
  public bottom: EventEmitter<ScrollBottomEvent>;

  @Output()
  public top: EventEmitter<ScrollTopEvent>;

  private intersectionObserver: IntersectionObserver | undefined;

  constructor(
    private el: ElementRef,
    private cursorStoreService: CursorStoreService,
  ) {
    this.uniqId = '';
    this.scrollBottomOnInit = false;
    this.countPerLoad = 50;
    this.bottom = new EventEmitter<ScrollBottomEvent>();
    this.top = new EventEmitter<ScrollTopEvent>();
    this.autoFetchingBottom = true;
    this.autoFetchingTop = true;
    this.autoLoadScrollPosition = true;
  }

  ngOnInit(): void {
  }

  async ngAfterViewInit(): Promise<void> {
    this.init();
  }

  init(): void {
    // Validate current state
    if (this.bottomDirective === undefined) {
      throw new Error('MugenScrollBottomDirective is undefined in ng-content');
    }
    if (this.topDirective === undefined) {
      throw new Error('MugenScrollTopDirective is undefined in ng-content');
    }
    if (this.dataDirective === undefined) {
      throw new Error('MugenScrollDataDirective is undefined in ng-content');
    }
    if (this.provider === undefined) {
      throw new Error('provider is undefined in ng-content');
    }
    // Clear previous state
    this.dataDirective.clear();
    this.dataDirective.newCursor = this.provider.newCursor;
    if (this.intersectionObserver !== undefined) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = undefined;
    }
    // New current state
    this.intersectionObserver = new IntersectionObserver(
      (entities: Array<IntersectionObserverEntry>): void => {
        entities.forEach(entity => {
          if (this.bottomDirective === undefined) {
            throw new Error('MugenScrollBottomDirective is undefined in ng-content');
          }
          if (this.topDirective === undefined) {
            throw new Error('MugenScrollTopDirective is undefined in ng-content');
          }
          if (entity.target === this.topDirective.element && entity.isIntersecting === true) {
            this.top.emit({});
            if (this.autoFetchingTop === false) {
              return;
            }
            this.fetchTop();
          }
          if (entity.target === this.bottomDirective.element && entity.isIntersecting === true) {
            this.bottom.emit({});
            if (this.autoFetchingBottom === false) {
              return;
            }
            this.fetchBottom();
          }
        });
      },
      {
        root: this.el.nativeElement,
        rootMargin: '0px',
        threshold: 1.0,
      },
    );
    this.intersectionObserver.observe(this.bottomDirective.element);
    this.intersectionObserver.observe(this.topDirective.element);
    // Load data
    if (this.autoLoadScrollPosition) {
      const cursorStoreInfo = this.cursorStoreService.load(this.provider.scrollId);
      if (cursorStoreInfo !== undefined) {
        this.provider.fetchOnLoad(cursorStoreInfo).then(datas => {
          if (this.dataDirective === undefined) {
            throw new Error('MugenScrollDataDirective is undefined in ng-content');
          }
          this.dataDirective.push(...datas);
          (this.el.nativeElement as HTMLElement).scroll(0, cursorStoreInfo.scrollTop);
        });
        return;
      }
    }
    this.provider.fetchOnInit(this.countPerLoad).then(datas => {
      if (this.dataDirective === undefined) {
        throw new Error('MugenScrollDataDirective is undefined in ng-content');
      }
      this.dataDirective.push(...datas);
      if (this.scrollBottomOnInit) {
        this.scrollBottom();
      }
    });
  }

  saveScrollPosition(): void {
    if (this.provider === undefined) {
      console.error('provider is undefined in ng-content');
      return;
    }
    if (this.dataDirective === undefined) {
      console.error('MugenScrollDataDirective is undefined in ng-content');
      return;
    }
    if (this.dataDirective.top === undefined) {
      console.error('MugenScrollDataDirective.top is undefined in ng-content');
      return;
    }
    if (this.dataDirective.bottom === undefined) {
      console.error('MugenScrollDataDirective.bottom is undefined in ng-content');
      return;
    }
    this.cursorStoreService.save(
      this.provider.scrollId,
      this.provider.newCursor(this.dataDirective.bottom),
      this.provider.newCursor(this.dataDirective.top),
      this.countPerLoad,
      (this.el.nativeElement as HTMLElement).scrollTop,
    );
  }

  async fetchBottom(): Promise<void> {
    if (this.provider === undefined) {
      throw new Error('provider is undefined in ng-content');
    }
    if (this.dataDirective === undefined) {
      throw new Error('MugenScrollDataDirective is undefined in ng-content');
    }
    if (this.dataDirective.bottom === undefined) {
      return;
    }
    const datas = await this.provider.fetchBottom(
      this.provider.newCursor(this.dataDirective.bottom),
      this.countPerLoad,
      false,
    );
    this.dataDirective.push(...datas);
  }

  async fetchTop(): Promise<void> {
    if (this.provider === undefined) {
      throw new Error('provider is undefined in ng-content');
    }
    if (this.dataDirective === undefined) {
      throw new Error('MugenScrollDataDirective is undefined in ng-content');
    }
    if (this.dataDirective.top === undefined) {
      return;
    }
    const datas = await this.provider.fetchTop(
      this.provider.newCursor(this.dataDirective.top),
      this.countPerLoad,
      false,
    );
    const topBeforeAdded = this.dataDirective.top;
    this.dataDirective.unshift(...datas);
    this.scrollTopAt(topBeforeAdded);
  }

  private scrollTopAt(at: object): void {
    if (this.provider === undefined) {
      throw new Error('provider is undefined in ng-content');
    }
    if (this.dataDirective === undefined) {
      throw new Error('MugenScrollDataDirective is undefined in ng-content');
    }
    if (this.dataDirective.top !== undefined) {
      if (this.provider.newCursor(this.dataDirective.top).toString() === this.provider.newCursor(at).toString()) {
        return;
      }
    }
    let s = 0;
    const cursor = this.provider.newCursor(at);
    const el = this.el.nativeElement as HTMLElement;
    for (let i = 0; i < el.children.length; i++) {
      const v = el.children.item(i);
      if (v === null) {
        continue;
      }
      const u = v as HTMLElement;
      const cursorRootNode = u.getAttribute('_cursor');
      if (cursorRootNode === null) {
        continue;
      }
      // console.log(cursorRootNode, cursor.toString(), cursorRootNode === cursor.toString());
      if (cursorRootNode === cursor.toString()) {
        break;
      }
      s += u.offsetHeight;
    }
    el.scroll(0, s);
  }

  private scrollBottom(): void {
    (this.el.nativeElement as HTMLElement).scroll(0, 9999999);
  }
}
