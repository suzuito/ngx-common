import { Component, Provider, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed, TestBedStatic } from '@angular/core/testing';
import { Cursor } from './cursor';
import { CursorStoreInfo, CursorStoreService } from './cursor-store.service';
import { DataProvider } from './mugen-scroll';
import { MugenScrollBottomDirective } from './mugen-scroll-bottom.directive';
import { MugenScrollDataDirective } from './mugen-scroll-data.directive';
import { MugenScrollTopDirective } from './mugen-scroll-top.directive';
import { NgxMugenScrollComponent } from './ngx-mugen-scroll.component';

interface TestNgxMugenScrollBaseComponent {
  c: NgxMugenScrollComponent | undefined;
}

@Component({
  selector: 'lib-test-component',
  template: `
  <lib-ngx-mugen-scroll [provider]='provider'>
      <div libMugenScrollTop></div>
      <div *libMugenScrollData='let data = data'></div>
      <div libMugenScrollBottom></div>
  </lib-ngx-mugen-scroll>`,
})
class TestNgxMugenScrollDefaultComponent implements TestNgxMugenScrollBaseComponent {
  @ViewChild(NgxMugenScrollComponent)
  public c: NgxMugenScrollComponent | undefined;
  constructor(public provider: TestDataProvider) { }
}

@Component({
  selector: 'lib-test-component',
  template: `
  <lib-ngx-mugen-scroll [provider]='provider' [scrollBottomOnInit]='scrollBottomOnInit' [autoInitAfterViewInit]='autoInitAfterViewInit' [countPerLoad]='countPerLoad'>
      <div libMugenScrollTop></div>
      <div *libMugenScrollData='let data = data'></div>
      <div libMugenScrollBottom></div>
  </lib-ngx-mugen-scroll>`,
})
class TestNgxMugenScrollComponent implements TestNgxMugenScrollBaseComponent {
  @ViewChild(NgxMugenScrollComponent)
  public c: NgxMugenScrollComponent | undefined;
  public scrollBottomOnInit = false;
  public autoInitAfterViewInit = false;
  public countPerLoad = 3;
  constructor(public provider: TestDataProvider) { }
}

interface TestData {
  index: number;
  name: string;
}

class TestDataCursor extends Cursor {
  constructor(v: TestData) {
    super([v.index]);
  }
}

class TestDataProvider implements DataProvider<TestData> {
  public datas: Array<TestData>;
  public scrollId = 'test';
  constructor(n: number) {
    this.datas = [];
    for (let i = 0; i < n; i++) {
      this.datas.push({ index: i, name: `id-${i}` });
    }
  }
  newCursor(data: TestData): Cursor {
    return new TestDataCursor(data);
  }
  async fetchBottom(cursor: Cursor, n: number, includeEqual: boolean): Promise<Array<TestData>> {
    const r = [];
    let i = 0;
    if (!includeEqual) {
      i++;
    }
    for (; i < n; i++) {
      const j = cursor.getItem(0) as number + i;
      if (j > this.datas.length - 1) {
        break;
      }
      r.push(this.datas[j]);
    }
    return r;
  }
  async fetchTop(cursor: Cursor, n: number, includeEqual: boolean): Promise<Array<TestData>> {
    const r = [];
    let i = 0;
    if (!includeEqual) {
      i++;
    }
    for (; i < n; i++) {
      const j = (cursor.getItem(0) as number) - i;
      if (j < 0) {
        break;
      }
      r.unshift(this.datas[j]);
    }
    return r;
  }
  async fetchOnLoad(info: CursorStoreInfo): Promise<Array<TestData>> {
    return await this.fetchBottom(
      info.topCursor,
      info.n,
      true,
    );
  }
  async fetchOnInit(n: number): Promise<Array<TestData>> {
    return await this.fetchBottom(
      this.newCursor({ index: 0, name: '' }),
      n,
      true
    );
  }
}

describe('NgxMugenScrollComponent', () => {
  let component: TestNgxMugenScrollComponent;
  let fixture: ComponentFixture<TestNgxMugenScrollComponent>;

  let mockIntersectionObserver: IntersectionObserver;

  let spyBottomDirective: jasmine.SpyObj<MugenScrollBottomDirective>;
  let spyTopDirective: jasmine.SpyObj<MugenScrollTopDirective>;
  let spyIntersectionObserver: jasmine.SpyObj<IntersectionObserver>;

  let spyDataDirectivePush: jasmine.Spy;
  let spyDataDirectiveClear: jasmine.Spy;

  const declarations = [
    TestNgxMugenScrollComponent,
    TestNgxMugenScrollDefaultComponent,
    NgxMugenScrollComponent,
    MugenScrollTopDirective,
    MugenScrollBottomDirective,
    MugenScrollDataDirective,
  ];

  let providers: Array<Provider>;

  function c(): NgxMugenScrollComponent {
    if (component.c === undefined) {
      throw new Error('c is undefined');
    }
    return component.c;
  }

  function setSpy(): void {
    spyBottomDirective = spyOnAllFunctions(c().bottomDirective as MugenScrollBottomDirective);
    spyTopDirective = spyOnAllFunctions(c().topDirective as MugenScrollTopDirective);
    spyDataDirectivePush = spyOn(c().dataDirective as MugenScrollDataDirective, 'push');
    spyDataDirectiveClear = spyOn(c().dataDirective as MugenScrollDataDirective, 'clear');
    mockIntersectionObserver = new IntersectionObserver(() => { });
    spyIntersectionObserver = spyOnAllFunctions(mockIntersectionObserver);
    c().newIntersectionObserver = (callback: IntersectionObserverCallback): IntersectionObserver => mockIntersectionObserver;
  }

  async function compileComponents(): Promise<void> {
    await TestBed.configureTestingModule({
      declarations,
      providers,
    })
      .compileComponents();
    fixture = TestBed.createComponent(TestNgxMugenScrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenRenderingDone();
    setSpy();
  }

  beforeEach(async () => {
    providers = [];
  });

  it('Default setting', async () => {
    providers.push({
      provide: TestDataProvider,
      useValue: new TestDataProvider(100),
    });
    await TestBed.configureTestingModule({
      declarations,
      providers,
    })
      .compileComponents();
    const f = TestBed.createComponent(TestNgxMugenScrollDefaultComponent);
    const cc = f.componentInstance;
    f.detectChanges();
    await f.whenRenderingDone();
    expect(cc.c?.scrollBottomOnInit).toBe(false);
    expect(cc.c?.autoInitAfterViewInit).toBe(true);
    expect(cc.c?.autoFetchingBottom).toBe(true);
    expect(cc.c?.autoFetchingTop).toBe(true);
    expect(cc.c?.countPerLoad).toBe(10);
    expect(cc.c?.countPerLoadMode).toBe('small');
  });

  describe('Provider 100 scroll bottom on init', () => {

    beforeEach(() => {
      providers.push({
        provide: TestDataProvider,
        useValue: new TestDataProvider(100),
      });
    });

    describe('ngOnChange', () => {
      beforeEach(async () => {
        await compileComponents();
      });

      it('countPerLoad', () => {
        c().ngOnChanges({
          countPerLoadMode: {
            isFirstChange: () => false,
            firstChange: false,
            previousValue: '',
            currentValue: 'small',
          },
        });
        expect(c().countPerLoad).toBe(10);

        c().ngOnChanges({
          countPerLoadMode: {
            isFirstChange: () => false,
            firstChange: false,
            previousValue: '',
            currentValue: 'big',
          },
        });
        expect(c().countPerLoad).toBe(100);

        c().ngOnChanges({
          countPerLoadMode: {
            isFirstChange: () => false,
            firstChange: false,
            previousValue: '',
            currentValue: 'middle',
          },
        });
        expect(c().countPerLoad).toBe(50);
      });
    });

    describe('init', () => {
      let spyScrollBottom: jasmine.Spy;
      let spyScrollTop: jasmine.Spy;

      beforeEach(async () => {
        await compileComponents();
      });

      beforeEach(() => {
        spyScrollBottom = spyOn(c(), 'scrollBottom');
        spyScrollTop = spyOn(c(), 'scrollTop');
      });

      describe('Success cases provided by provider.fetchOnInit', () => {

        afterEach(() => {
          expect(spyDataDirectivePush.calls.count()).toBe(1);
          expect(spyDataDirectivePush.calls.argsFor(0)).toEqual([
            { index: 0, name: `id-0` },
            { index: 1, name: `id-1` },
            { index: 2, name: `id-2` },
            { index: 3, name: `id-3` },
            { index: 4, name: `id-4` },
            { index: 5, name: `id-5` },
            { index: 6, name: `id-6` },
            { index: 7, name: `id-7` },
            { index: 8, name: `id-8` },
            { index: 9, name: `id-9` },
          ]);
          expect(spyDataDirectiveClear.calls.count()).toBe(1);
          expect(spyIntersectionObserver.observe.calls.count()).toBe(2);
          expect(spyIntersectionObserver.observe.calls.argsFor(0)).toEqual([component.c?.bottomDirective?.element as any]);
          expect(spyIntersectionObserver.observe.calls.argsFor(1)).toEqual([component.c?.topDirective?.element as any]);
        });

        it('init with scrollTop', async () => {
          await c().init();
          expect(spyIntersectionObserver.disconnect.calls.count()).toBe(0);
          expect(spyScrollBottom.calls.count()).toBe(0);
          expect(spyScrollTop.calls.count()).toBe(1);
        });

        it('init with scrollBottom', async () => {
          c().scrollBottomOnInit = true;
          await c().init();
          expect(spyIntersectionObserver.disconnect.calls.count()).toBe(0);
          expect(spyScrollBottom.calls.count()).toBe(1);
          expect(spyScrollTop.calls.count()).toBe(0);
        });

        it('init with existing inetersection observer', async () => {
          c().intersectionObserver = mockIntersectionObserver;
          await c().init();
          expect(spyIntersectionObserver.disconnect.calls.count()).toBe(1);
          expect(spyScrollBottom.calls.count()).toBe(0);
          expect(spyScrollTop.calls.count()).toBe(1);
        });

        it('init with autoLoadScrollPosition==false', async () => {
          c().autoLoadScrollPosition = false;
          await c().init();
          expect(spyIntersectionObserver.disconnect.calls.count()).toBe(0);
          expect(spyScrollBottom.calls.count()).toBe(0);
          expect(spyScrollTop.calls.count()).toBe(1);
        });
      });

    });

    describe('Success cases provided by provider.fetchOnLoad', () => {
      let mockCursorStoreService: CursorStoreService;
      let spyScrollBottom: jasmine.Spy;
      let spyScrollTop: jasmine.Spy;
      let spyCursorStoreServiceLoad: jasmine.Spy;

      beforeEach(async () => {
        const returnedCursorStoreInfo: CursorStoreInfo = {
          topCursor: new TestDataCursor({ index: 50, name: 'id-50' }),
          bottomCursor: new TestDataCursor({ index: 55, name: 'id-55' }),
          n: 5,
          scrollTop: 101,
        };
        mockCursorStoreService = new CursorStoreService();
        spyCursorStoreServiceLoad = spyOn(mockCursorStoreService, 'load').and.returnValue(returnedCursorStoreInfo);
        providers.push({
          provide: CursorStoreService,
          useValue: mockCursorStoreService,
        });
        await compileComponents();
      });

      beforeEach(() => {
        spyScrollBottom = spyOn(c(), 'scrollBottom');
        spyScrollTop = spyOn(c(), 'scrollTop');
      });

      it('', async () => {
        await c().init();

        expect(spyDataDirectivePush.calls.count()).toBe(1);
        expect(spyDataDirectivePush.calls.argsFor(0)).toEqual([
          { index: 50, name: `id-50` },
          { index: 51, name: `id-51` },
          { index: 52, name: `id-52` },
          { index: 53, name: `id-53` },
          { index: 54, name: `id-54` },
        ]);
        expect(spyDataDirectiveClear.calls.count()).toBe(1);
      });

    });

    describe('saveScrollPosition', () => {
      let mockCursorStoreService: CursorStoreService;
      let spyCursorStoreServiceSave: jasmine.Spy;

      beforeEach(async () => {
        mockCursorStoreService = new CursorStoreService();
        spyCursorStoreServiceSave = spyOn(mockCursorStoreService, 'save');
        providers.push({
          provide: CursorStoreService,
          useValue: mockCursorStoreService,
        });
        await compileComponents();
      });

      it('top and bottom are not undefined', async () => {
        const dataDirective = c().dataDirective;
        if (dataDirective === undefined) {
          throw new Error('dataDirective is undefined');
        }
        dataDirective.top = { index: 0, name: 'not undefined 0' };
        dataDirective.bottom = { index: 999, name: 'not undefined 999' };
        spyOnProperty(dataDirective, 'length').and.returnValue(100);
        c().saveScrollPosition();
        expect(spyCursorStoreServiceSave.calls.count()).toBe(1);
        expect(spyCursorStoreServiceSave.calls.argsFor(0)).toEqual([
          'test',
          new TestDataCursor(dataDirective.bottom as TestData),
          new TestDataCursor(dataDirective.top as TestData),
          100,
          0,
        ]);
      });
    });

    describe('fetchBottom', () => {
      beforeEach(async () => {
        await compileComponents();
      });

      it('dataDirective is undefined', async () => {
        await c().fetchBottom();
      });
    });
  });
});
