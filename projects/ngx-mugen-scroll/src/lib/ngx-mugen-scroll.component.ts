import {
  AfterViewInit,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter, Input, OnChanges, OnInit, Output,
  SimpleChanges
} from '@angular/core';
import { MugenScrollTopDirective } from './mugen-scroll-top.directive';
import { MugenScrollBottomDirective } from './mugen-scroll-bottom.directive';
import { DataProvider } from './mugen-scroll';
import { CursorStoreService } from './cursor-store.service';
import { MugenScrollDataDirective } from './mugen-scroll-data.directive';
import { Logger } from './logger';

export interface ScrollBottomEvent {
  intersectionRatio: number;
}
export interface ScrollTopEvent {
  intersectionRatio: number;
}

class NullLogger implements Logger {
  info(...msgs: Array<string>): void { }
}

function callbackIntersectionObserver(component: NgxMugenScrollComponent): IntersectionObserverCallback {
  return (entities: Array<IntersectionObserverEntry>): void => {
    entities.forEach(entity => {
      if (component.bottomDirective === undefined) {
        throw new Error('MugenScrollBottomDirective is undefined in ng-content');
      }
      if (component.topDirective === undefined) {
        throw new Error('MugenScrollTopDirective is undefined in ng-content');
      }
      if (entity.target === component.topDirective.element && entity.isIntersecting === true) {
        component.top.emit({
          intersectionRatio: entity.intersectionRatio,
        });
        if (component.autoFetchingTop === false) {
          return;
        }
        component.fetchTop();
      }
      if (entity.target === component.bottomDirective.element && entity.isIntersecting === true) {
        component.bottom.emit({
          intersectionRatio: entity.intersectionRatio,
        });
        if (component.autoFetchingBottom === false) {
          return;
        }
        component.fetchBottom();
      }
    });
  };
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

  /**
   * @ignore
   */
  @ContentChild(MugenScrollBottomDirective)
  public bottomDirective: MugenScrollBottomDirective | undefined;
  private get _bottomDirective(): MugenScrollBottomDirective {
    if (this.bottomDirective === undefined) {
      throw new Error('bottomDirective is undefined');
    }
    return this.bottomDirective;
  }

  /**
   * @ignore
   */
  @ContentChild(MugenScrollTopDirective)
  public topDirective: MugenScrollTopDirective | undefined;
  private get _topDirective(): MugenScrollTopDirective {
    if (this.topDirective === undefined) {
      throw new Error('topDirective is undefined');
    }
    return this.topDirective;
  }

  /**
   * @ignore
   */
  @ContentChild(MugenScrollDataDirective)
  public dataDirective: MugenScrollDataDirective | undefined;
  private get _dataDirective(): MugenScrollDataDirective {
    if (this.dataDirective === undefined) {
      throw new Error('dataDirective is undefined');
    }
    return this.dataDirective;
  }

  /**
   * Provider of stream data
   */
  @Input()
  public provider: DataProvider<object> | undefined;
  private get _provider(): DataProvider<object> {
    if (this.provider === undefined) {
      throw new Error('provider is undefined');
    }
    return this.provider;
  }

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
   * Whether call init function on afterViewInit
   */
  @Input()
  public autoInitAfterViewInit: boolean;

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

  /**
   * @ignore
   */
  public intersectionObserver: IntersectionObserver | undefined;

  private timeoutMillisecondsAfterBinding: number;

  /**
   * @ignore
   */
  public countPerLoad: number;

  /**
   * @ignore
   */
  public newIntersectionObserver:
    (callback: IntersectionObserverCallback, options?: IntersectionObserverInit | undefined) => IntersectionObserver;

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
    this.autoInitAfterViewInit = true;
    this.newIntersectionObserver = (callback: IntersectionObserverCallback, options?: IntersectionObserverInit | undefined) => {
      return new IntersectionObserver(callback, options);
    };
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
    if (this.autoInitAfterViewInit) {
      await this.init();
    }
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
  async init(): Promise<void> {
    this._dataDirective.max = this.countPerLoad * 3;
    // Clear previous state
    this._dataDirective.clear();
    this._dataDirective.newCursor = this._provider.newCursor;
    if (this.intersectionObserver !== undefined) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = undefined;
    }
    // New current state
    this.intersectionObserver = this.newIntersectionObserver(
      callbackIntersectionObserver(this),
      {
        root: this.el.nativeElement,
        rootMargin: '0px',
        threshold: 1.0,
      },
    );
    this.intersectionObserver.observe(this._bottomDirective.element);
    this.intersectionObserver.observe(this._topDirective.element);
    // Load data
    let datas = [];
    if (this.autoLoadScrollPosition) {
      console.log(this.cursorStoreService);
      const cursorStoreInfo = this.cursorStoreService.load(this._provider.scrollId);
      if (cursorStoreInfo !== undefined) {
        datas = await this._provider.fetchOnLoad(cursorStoreInfo);
        this.push(...datas);
        (this.el.nativeElement as HTMLElement).scroll(0, cursorStoreInfo.scrollTop);
        return;
      }
    }
    console.log('1');
    console.log('countPerLoad', this.countPerLoad);
    datas = await this._provider.fetchOnInit(this.countPerLoad);
    console.log(datas);
    console.log('2');
    this.push(...datas);
    console.log('3');
    if (this.scrollBottomOnInit) {
      this.scrollBottom();
      return;
    }
    this.scrollTop();
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
    if (this._dataDirective.top === undefined || this._dataDirective.bottom === undefined) {
      return;
    }
    this.cursorStoreService.save(
      this._provider.scrollId,
      this._provider.newCursor(this._dataDirective.bottom),
      this._provider.newCursor(this._dataDirective.top),
      this._dataDirective.length,
      (this.el.nativeElement as HTMLElement).scrollTop,
    );
  }

  /**
   * Fetch data and appended to bottom.
   * The data is provided by `fetchBottom` method of the `provider`.
   */
  async fetchBottom(): Promise<void> {
    if (this._dataDirective.bottom === undefined) {
      return;
    }
    const datas = await this._provider.fetchBottom(
      this._provider.newCursor(this._dataDirective.bottom),
      this.countPerLoad,
      false,
    );
    const bottomBeforeAdded = this._dataDirective.bottom;
    this.push(...datas);

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
    if (this._dataDirective.top === undefined) {
      return;
    }
    const datas = await this._provider.fetchTop(
      this._provider.newCursor(this._dataDirective.top),
      this.countPerLoad,
      false,
    );
    const topBeforeAdded = this._dataDirective.top;
    this.unshift(...datas);

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

  /**
   * @ignore
   */
  scrollTopAt(at: object): void {
    if (this._dataDirective.top !== undefined) {
      if (this._provider.newCursor(this._dataDirective.top).toString() === this._provider.newCursor(at).toString()) {
        return;
      }
    }
    let s = 0;
    const cursor = this._provider.newCursor(at);
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

  /**
   * @ignore
   */
  scrollBottomAt(at: object): void {
    if (this._dataDirective.bottom !== undefined) {
      if (this._provider.newCursor(this._dataDirective.bottom).toString() === this._provider.newCursor(at).toString()) {
        return;
      }
    }
    let s = 0;
    const cursor = this._provider.newCursor(at);
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
    s += this._bottomDirective.element.offsetHeight;
    logs.push({ element: this._bottomDirective.element, offsetHeight: this._bottomDirective.element.offsetHeight });
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

  /**
   * @ignore
   */
  scrollBottom(): void {
    (this.el.nativeElement as HTMLElement).scroll(0, 9999999);
  }

  /**
   * @ignore
   */
  scrollTop(): void {
    (this.el.nativeElement as HTMLElement).scroll(0, 0);
  }

  private push(...datas: Array<object>): void {
    this._dataDirective.push(...datas);
    if (this._dataDirective.length > this._dataDirective.max) {
      this._dataDirective.arrangeAfterPush();
    }
  }

  private unshift(...datas: Array<object>): void {
    this._dataDirective.unshift(...datas);
    if (this._dataDirective.length > this._dataDirective.max) {
      this._dataDirective.arrangeAfterUnshift();
    }
  }
}
