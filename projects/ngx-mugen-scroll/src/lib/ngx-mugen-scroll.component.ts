import { AfterViewInit, Component, ContentChild, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ReflectiveInjector, SimpleChanges } from '@angular/core';
import { MugenScrollTopDirective } from './mugen-scroll-top.directive';
import { MugenScrollBottomDirective } from './mugen-scroll-bottom.directive';
import { DataProvider } from './mugen-scroll';
import { CursorStoreService } from './cursor-store.service';
import { MugenScrollDataDirective } from './mugen-scroll-data.directive';
import { Logger } from './logger';

export interface ScrollBottomEvent { }
export interface ScrollTopEvent { }

class NullLogger implements Logger {
  info(...msgs: Array<string>): void { }
}

@Component({
  selector: 'lib-ngx-mugen-scroll',
  template: `
    <ng-content></ng-content>
  `,
  styles: [
  ]
})
export class NgxMugenScrollComponent implements OnInit, AfterViewInit, OnChanges {

  @ContentChild(MugenScrollBottomDirective)
  private bottomDirective: MugenScrollBottomDirective | undefined;

  @ContentChild(MugenScrollTopDirective)
  private topDirective: MugenScrollTopDirective | undefined;

  @ContentChild(MugenScrollDataDirective)
  private dataDirective: MugenScrollDataDirective | undefined;

  /**
   * Provider of stream data
   */
  @Input()
  public provider: DataProvider<object> | undefined;

  /**
   * Unique id of stream.
   * This id is used to save scroll position.
   */
  @Input()
  public uniqId: string;

  /**
   * Whether scroll to bottom or not when stream is displayed initially.
   */
  @Input()
  public scrollBottomOnInit: boolean;

  /**
   * The number of data fetched by provider when new data is requested.
   * If 'small' then 10.
   * If 'middle' then 50.
   * If 'big' then 100.
   */
  @Input()
  public countPerLoadMode: 'small' | 'middle' | 'big';

  /**
   * Whether the data is fetched automatically when scrolled to bottom.
   */
  @Input()
  public autoFetchingBottom: boolean;

  /**
   * Whether the data is fetched automatically when scrolled to top.
   */
  @Input()
  public autoFetchingTop: boolean;

  /**
   * Whether the scroll position is loaded automatically.
   */
  @Input()
  public autoLoadScrollPosition: boolean;

  /**
   * Event emitted when scrolled to bottom.
   */
  @Output()
  public bottom: EventEmitter<ScrollBottomEvent>;

  /**
   * Event emitted when scrolled to top.
   */
  @Output()
  public top: EventEmitter<ScrollTopEvent>;

  /**
   * @ignore
   * Logger for debug
   */
  @Input()
  public logger: Logger;

  private intersectionObserver: IntersectionObserver | undefined;
  private timeoutMillisecondsAfterBinding: number;
  private countPerLoad: number;

  /**
   * @ignore
   */
  constructor(
    private el: ElementRef,
    private cursorStoreService: CursorStoreService,
  ) {
    this.uniqId = '';
    this.scrollBottomOnInit = false;
    this.countPerLoad = 10;
    this.bottom = new EventEmitter<ScrollBottomEvent>();
    this.top = new EventEmitter<ScrollTopEvent>();
    this.autoFetchingBottom = true;
    this.autoFetchingTop = true;
    this.autoLoadScrollPosition = true;
    this.timeoutMillisecondsAfterBinding = 1;
    this.logger = new NullLogger();
    this.countPerLoadMode = 'small';
    this.setCountPerLoad();
  }

  /**
   * @ignore
   */
  ngOnInit(): void {
  }

  /**
   * @ignore
   */
  async ngAfterViewInit(): Promise<void> {
    this.init();
  }

  /**
   * @ignore
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.countPerLoadMode) {
      this.countPerLoadMode = changes.countPerLoadMode.currentValue;
      this.setCountPerLoad();
    }
  }

  /**
   * Initialize stream. This method is also called in `ngAfterViewInit`.
   */
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
    this.dataDirective.max = this.countPerLoad * 3;
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
      } else {
        this.scrollTopAt();
      }
    });
  }

  private setCountPerLoad(): void {
    this.countPerLoad = 10;
    switch (this.countPerLoadMode) {
      case 'middle':
        this.countPerLoad = 50;
        break;
      case 'big':
        this.countPerLoad = 100;
        break;
    }
  }

  /**
   * Save current scroll position.
   * Scroll position is saved on memory and related to `uniqId`.
   */
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
      this.dataDirective.length,
      (this.el.nativeElement as HTMLElement).scrollTop,
    );
  }

  /**
   * Fetch data and appended to bottom.
   * The data is provided by `fetchBottom` method of the `provider`.
   */
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
    const bottomBeforeAdded = this.dataDirective.bottom;
    this.dataDirective.push(...datas);

    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => {
          this.scrollBottomAt(bottomBeforeAdded);
          resolve();
        }, this.timeoutMillisecondsAfterBinding);
      } catch (err) {
        reject();
      }
    });
  }

  /**
   * Fetch data and appended to top.
   * The data is provided by `fetchTop` method of the `provider`.
   */
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

    return new Promise((resolve, reject) => {
      try {
        setTimeout(() => {
          this.scrollTopAt(topBeforeAdded);
          resolve();
        }, this.timeoutMillisecondsAfterBinding);
      } catch (err) {
        reject();
      }
    });
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

  private scrollBottomAt(at: object): void {
    if (this.provider === undefined) {
      throw new Error('provider is undefined in ng-content');
    }
    if (this.dataDirective === undefined) {
      throw new Error('MugenScrollDataDirective is undefined in ng-content');
    }
    if (this.dataDirective.bottom !== undefined) {
      if (this.provider.newCursor(this.dataDirective.bottom).toString() === this.provider.newCursor(at).toString()) {
        return;
      }
    }
    if (this.topDirective === undefined) {
      throw new Error('MugenScrollTopDirective is undefined in ng-content');
    }
    if (this.bottomDirective === undefined) {
      throw new Error('MugenScrollTopDirective is undefined in ng-content');
    }
    let s = 0;
    const cursor = this.provider.newCursor(at);
    const el = this.el.nativeElement as HTMLElement;
    let u: HTMLElement | undefined;
    const logs: Array<any> = [];
    for (let i = 0; i < el.children.length; i++) {
      const v = el.children.item(i);
      if (v === null) {
        continue;
      }
      u = v as HTMLElement;
      const cursorRootNode = u.getAttribute('_cursor');
      // console.log(cursorRootNode, cursor.toString(), cursorRootNode === cursor.toString());
      if (cursorRootNode === cursor.toString()) {
        break;
      }
      s += u.offsetHeight;
      logs.push({ element: u, offsetHeight: u.offsetHeight });
    }
    if (u === undefined) {
      return;
    }
    s -= (this.el.nativeElement as HTMLElement).clientHeight;
    logs.push({ element: this.el.nativeElement, offsetHeight: -(this.el.nativeElement as HTMLElement).clientHeight });
    s += u.offsetHeight;
    logs.push({ element: u, offsetHeight: u.offsetHeight });
    s += this.bottomDirective.element.offsetHeight;
    logs.push({ element: this.bottomDirective.element, offsetHeight: this.bottomDirective.element.offsetHeight });
    el.scroll(0, s);

    logs.forEach((v, i) => {
      this.info(`i: ${i}, element: ${v.element}, offset: ${v.offsetHeight}`);
    });
    this.info(`scroll: ${s}`);
  }

  private info(...msgs: Array<string>): void {
    if (this.logger === undefined) {
      return;
    }
    this.logger.info(...msgs);
  }

  private scrollBottom(): void {
    (this.el.nativeElement as HTMLElement).scroll(0, 9999999);
  }

  private scrollTop(): void {
    (this.el.nativeElement as HTMLElement).scroll(0, 0);
  }
}
