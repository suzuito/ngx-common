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
  }

  ngOnInit(): void {
  }

  async ngAfterViewInit(): Promise<void> {
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

    this.dataDirective.newCursor = this.provider.newCursor;

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

    const datas = await this.provider.fetchOnInit(this.countPerLoad);
    this.dataDirective.push(...datas);
    const el = this.el.nativeElement as HTMLElement;
    for (let i = 0; i < el.children.length; i++) {
      console.log(el.children[i].clientHeight);
    }
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
    this.scrollToTopAt(topBeforeAdded);
  }

  scrollToTopAt(at: object): void {
    if (this.dataDirective === undefined) {
      throw new Error('MugenScrollDataDirective is undefined in ng-content');
    }
    if (this.provider === undefined) {
      throw new Error('provider is undefined in ng-content');
    }
    if (this.dataDirective.top !== undefined) {
      if (this.provider.newCursor(this.dataDirective.top).toString() === this.provider.newCursor(at).toString()) {
        return;
      }
    }
    let s = 0;
    const el: HTMLElement = this.el.nativeElement;
    for (let i = 0; i < el.children.length; i++) {
      const child = el.children.item(i) as HTMLElement;
      if (child === null) {
        continue;
      }
      const cursorString = child.getAttribute('_cursor');
      if (cursorString === null) {
        continue;
      }
      if (cursorString === this.provider.newCursor(at).toString()) {
        break;
      }
      s += child.offsetHeight;
    }
    if (this.topDirective !== undefined) {
      // s += this.topDirective.element.offsetHeight;
      // console.log(s, this.topDirective.element.offsetHeight);
      // s -= this.topDirective.element.offsetHeight;
      // console.log(s, this.topDirective.element.offsetHeight);
    }
    el.scroll(0, s);
  }
}
