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
  constructor(public provider: TestDataProvider2) { }
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
  constructor(public provider: TestDataProvider2) { }
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

class TestDataProvider2 implements DataProvider<TestData> {
  public scrollId = 'test';
  constructor() {
  }
  newCursor(data: TestData): Cursor {
    return new TestDataCursor(data);
  }
  async fetchBottom(cursor: Cursor, n: number, includeEqual: boolean): Promise<Array<TestData>> {
    throw new Error('Not impl');
  }
  async fetchTop(cursor: Cursor, n: number, includeEqual: boolean): Promise<Array<TestData>> {
    throw new Error('Not impl');
  }
  async fetchOnLoad(info: CursorStoreInfo): Promise<Array<TestData>> {
    throw new Error('Not impl');
  }
  async fetchOnInit(n: number): Promise<Array<TestData>> {
    throw new Error('Not impl');
  }
}

describe('NgxMugenScrollComponent', () => {
  let component: TestNgxMugenScrollComponent;
  let fixture: ComponentFixture<TestNgxMugenScrollComponent>;

  let mockIntersectionObserver: IntersectionObserver;

  let mockProvider: TestDataProvider2;
  let spyProviderFetchOnInit: jasmine.Spy;
  let spyProviderFetchOnLoad: jasmine.Spy;
  let spyProviderFetchBottom: jasmine.Spy;
  let spyProviderFetchTop: jasmine.Spy;

  let mockCursorStoreService: CursorStoreService;
  let spyCursorStoreServiceLoad: jasmine.Spy;
  let spyCursorStoreServiceSave: jasmine.Spy;

  // let spyBottomDirective: jasmine.SpyObj<MugenScrollBottomDirective>;
  // let spyTopDirective: jasmine.SpyObj<MugenScrollTopDirective>;
  let spyIntersectionObserver: jasmine.SpyObj<IntersectionObserver>;

  let spyDataDirectivePush: jasmine.Spy;
  let spyDataDirectiveClear: jasmine.Spy;

  let spyScrollBottom: jasmine.Spy;
  let spyScrollBottomAt: jasmine.Spy;
  let spyScrollTopAt: jasmine.Spy;
  let spyScrollTop: jasmine.Spy;

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

  async function compileComponents2(): Promise<void> {
    await TestBed.configureTestingModule({
      declarations,
      providers,
    })
      .compileComponents();
    fixture = TestBed.createComponent(TestNgxMugenScrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenRenderingDone();
  }

  beforeEach(async () => {
    mockProvider = new TestDataProvider2();
    mockCursorStoreService = new CursorStoreService();
    providers = [
      {
        provide: TestDataProvider2,
        useValue: mockProvider,
      },
      {
        provide: CursorStoreService,
        useValue: mockCursorStoreService,
      },
    ];
  });

  it('Default setting', async () => {
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

  describe('ngOnChange', () => {
    beforeEach(async () => {
      await compileComponents2();
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

    let data: Array<TestData>;

    beforeEach(() => {
      data = [
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
      ];
    });

    describe('Success cases provided by provider.fetchOnInit', () => {

      beforeEach(async () => {
        spyProviderFetchOnInit = spyOn(mockProvider, 'fetchOnInit').and.resolveTo(data);
        spyProviderFetchOnLoad = spyOn(mockProvider, 'fetchOnLoad').and.resolveTo(data);
        await compileComponents2();
        spyScrollBottom = spyOn(c(), 'scrollBottom');
        spyScrollTop = spyOn(c(), 'scrollTop');
        spyDataDirectivePush = spyOn(c().dataDirective as MugenScrollDataDirective, 'push');
        spyDataDirectiveClear = spyOn(c().dataDirective as MugenScrollDataDirective, 'clear');
        mockIntersectionObserver = new IntersectionObserver(() => { });
        spyIntersectionObserver = spyOnAllFunctions(mockIntersectionObserver);
        c().newIntersectionObserver = () => mockIntersectionObserver;
      });

      afterEach(() => {
        expect(spyProviderFetchOnInit.calls.count()).toBe(1);
        expect(spyProviderFetchOnLoad.calls.count()).toBe(0);
        expect(spyDataDirectivePush.calls.count()).toBe(1);
        expect(spyDataDirectivePush.calls.argsFor(0)).toEqual(data);
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

    describe('Success cases provided by provider.fetchOnLoad', () => {
      let returnedCursorStoreInfo: CursorStoreInfo;
      beforeEach(async () => {
        returnedCursorStoreInfo = {
          topCursor: new TestDataCursor({ index: 50, name: 'id-50' }),
          bottomCursor: new TestDataCursor({ index: 55, name: 'id-55' }),
          n: 5,
          scrollTop: 101,
        };
        spyCursorStoreServiceLoad = spyOn(mockCursorStoreService, 'load').and.returnValue(returnedCursorStoreInfo);
        spyProviderFetchOnInit = spyOn(mockProvider, 'fetchOnInit').and.resolveTo(data);
        spyProviderFetchOnLoad = spyOn(mockProvider, 'fetchOnLoad').and.resolveTo(data);
        await compileComponents2();
        spyScrollBottom = spyOn(c(), 'scrollBottom');
        spyScrollTop = spyOn(c(), 'scrollTop');
        spyDataDirectivePush = spyOn(c().dataDirective as MugenScrollDataDirective, 'push');
        spyDataDirectiveClear = spyOn(c().dataDirective as MugenScrollDataDirective, 'clear');
        mockIntersectionObserver = new IntersectionObserver(() => { });
        spyIntersectionObserver = spyOnAllFunctions(mockIntersectionObserver);
        c().newIntersectionObserver = () => mockIntersectionObserver;
      });

      afterEach(() => {
        expect(spyProviderFetchOnInit.calls.count()).toBe(0);
        expect(spyProviderFetchOnLoad.calls.count()).toBe(1);
        expect(spyDataDirectivePush.calls.count()).toBe(1);
        expect(spyDataDirectivePush.calls.argsFor(0)).toEqual(data);
        expect(spyDataDirectiveClear.calls.count()).toBe(1);
        expect(spyIntersectionObserver.observe.calls.count()).toBe(2);
        expect(spyIntersectionObserver.observe.calls.argsFor(0)).toEqual([component.c?.bottomDirective?.element as any]);
        expect(spyIntersectionObserver.observe.calls.argsFor(1)).toEqual([component.c?.topDirective?.element as any]);
      });

      it('', async () => {
        await c().init();
      });
    });

    describe('saveScrollPosition', () => {
      let dataDirective: MugenScrollDataDirective;
      beforeEach(async () => {
        spyCursorStoreServiceSave = spyOn(mockCursorStoreService, 'save');
        await compileComponents2();
        const v = c().dataDirective;
        if (v === undefined) {
          throw new Error('dataDirective is undefined');
        }
        dataDirective = v;
      });

      it('DataDirective.top === undefined', () => {
        dataDirective.top = undefined;
        dataDirective.bottom = { index: 10, name: 'data-10' };
        c().saveScrollPosition();
        expect(spyCursorStoreServiceSave.calls.count()).toBe(0);
      });

      it('DataDirective.bottom === undefined', () => {
        dataDirective.top = { index: 0, name: 'data-0' };
        dataDirective.bottom = undefined;
        c().saveScrollPosition();
        expect(spyCursorStoreServiceSave.calls.count()).toBe(0);
      });

      it('DataDirective.bottom and top are not undefined', () => {
        dataDirective.top = { index: 0, name: 'data-0' };
        dataDirective.bottom = { index: 10, name: 'data-10' };
        spyOnProperty(dataDirective, 'length').and.returnValue(11);
        c().saveScrollPosition();
        expect(spyCursorStoreServiceSave.calls.count()).toBe(1);
        expect(spyCursorStoreServiceSave.calls.argsFor(0)).toEqual([
          'test',
          new TestDataCursor({ index: 10, name: 'data-10' }),
          new TestDataCursor({ index: 0, name: 'data-0' }),
          11,
          0,
        ]);
      });
    });
    describe('fetchBottom', () => {
      let dataDirective: MugenScrollDataDirective;
      beforeEach(async () => {
        data = [
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
        ];
        spyProviderFetchBottom = spyOn(mockProvider, 'fetchBottom').and.resolveTo(data);
        await compileComponents2();
        const v = c().dataDirective;
        if (v === undefined) {
          throw new Error('dataDirective is undefined');
        }
        dataDirective = v;
        spyScrollBottomAt = spyOn(c(), 'scrollBottomAt');
      });
      it('dataDirective.bottom is undefined', async () => {
        dataDirective.bottom = undefined;
        await c().fetchBottom();
        expect(spyProviderFetchBottom.calls.count()).toBe(0);
        expect(spyScrollBottomAt.calls.count()).toBe(0);
      });
      it('dataDirective.bottom is not undefined', async () => {
        dataDirective.bottom = { index: -1, name: 'id--1' };
        await c().fetchBottom();
        expect(spyProviderFetchBottom.calls.count()).toBe(1);
        expect(spyProviderFetchBottom.calls.argsFor(0)).toEqual([
          new TestDataCursor({ index: -1, name: 'id--1' }),
          c().countPerLoad,
          false,
        ]);
        expect(spyScrollBottomAt.calls.count()).toBe(1);
        expect(spyScrollBottomAt.calls.argsFor(0)).toEqual([
          { index: -1, name: 'id--1' },
        ]);
      });
    });
    describe('fetchTop', () => {
      let dataDirective: MugenScrollDataDirective;
      beforeEach(async () => {
        data = [
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
        ];
        spyProviderFetchTop = spyOn(mockProvider, 'fetchTop').and.resolveTo(data);
        await compileComponents2();
        const v = c().dataDirective;
        if (v === undefined) {
          throw new Error('dataDirective is undefined');
        }
        dataDirective = v;
        spyScrollTopAt = spyOn(c(), 'scrollTopAt');
      });
      it('dataDirective.top is undefined', async () => {
        dataDirective.top = undefined;
        await c().fetchTop();
        expect(spyProviderFetchTop.calls.count()).toBe(0);
        expect(spyScrollTopAt.calls.count()).toBe(0);
      });
      it('dataDirective.top is not undefined', async () => {
        dataDirective.top = { index: -1, name: 'id--1' };
        await c().fetchTop();
        expect(spyProviderFetchTop.calls.count()).toBe(1);
        expect(spyProviderFetchTop.calls.argsFor(0)).toEqual([
          { index: -1, name: 'id--1' },
          c().countPerLoad,
          false,
        ]);
        expect(spyScrollTopAt.calls.count()).toBe(1);
        expect(spyScrollTopAt.calls.argsFor(0)).toEqual([
          { index: -1, name: 'id--1' },
        ]);
      });
    });
  });
});
