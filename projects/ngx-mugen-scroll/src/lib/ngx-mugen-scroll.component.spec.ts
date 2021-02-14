import { Component, ContentChild, SimpleChange, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Cursor } from './cursor';
import { CursorStoreInfo } from './cursor-store.service';
import { DataProvider } from './mugen-scroll';
import { MugenScrollBottomDirective } from './mugen-scroll-bottom.directive';
import { MugenScrollDataDirective } from './mugen-scroll-data.directive';
import { MugenScrollTopDirective } from './mugen-scroll-top.directive';
import { NgxMugenScrollComponent } from './ngx-mugen-scroll.component';

interface TestNgxMugenScrollBaseComponent {
  c: NgxMugenScrollComponent | undefined;
  provider: DataProvider<TestData>;
}

@Component({
  selector: 'lib-test-component-100',
  template: `
  <lib-ngx-mugen-scroll [provider]='provider'>
      <div libMugenScrollTop></div>
      <div *libMugenScrollData='let data = data'></div>
      <div libMugenScrollBottom></div>
  </lib-ngx-mugen-scroll>`,
})
class TestNgxMugenScroll100Component implements TestNgxMugenScrollBaseComponent {
  @ViewChild(NgxMugenScrollComponent)
  public c: NgxMugenScrollComponent | undefined;
  public provider: DataProvider<TestData> = new TestDataProvider100();
}

@Component({
  selector: 'lib-test-component-100-scroll-bottom',
  template: `
  <lib-ngx-mugen-scroll [provider]='provider' [scrollBottomOnInit]=true>
      <div libMugenScrollTop></div>
      <div *libMugenScrollData='let data = data'></div>
      <div libMugenScrollBottom></div>
  </lib-ngx-mugen-scroll>`,
})
class TestNgxMugenScroll100ScrollBottomComponent implements TestNgxMugenScrollBaseComponent {
  @ViewChild(NgxMugenScrollComponent)
  public c: NgxMugenScrollComponent | undefined;
  public provider: DataProvider<TestData> = new TestDataProvider100();
}

@Component({
  selector: 'lib-test-component-0',
  template: `
  <lib-ngx-mugen-scroll [provider]='provider'>
      <div libMugenScrollTop></div>
      <div *libMugenScrollData='let data = data'></div>
      <div libMugenScrollBottom></div>
  </lib-ngx-mugen-scroll>`,
})
class TestNgxMugenScroll0Component implements TestNgxMugenScrollBaseComponent {
  @ViewChild(NgxMugenScrollComponent)
  public c: NgxMugenScrollComponent | undefined;
  public provider: DataProvider<TestData> = new TestDataProvider0();
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
      if (j > n - 1) {
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
    throw new Error('Not implemented');
  }
  async fetchOnInit(n: number): Promise<Array<TestData>> {
    return await this.fetchBottom(
      this.newCursor({ index: 0, name: '' }),
      n,
      true
    );
  }
}

class TestDataProvider0 extends TestDataProvider {
  constructor() {
    super(0);
  }
}

class TestDataProvider100 extends TestDataProvider {
  constructor() {
    super(100);
  }
}

describe('NgxMugenScrollComponent', () => {
  let component: TestNgxMugenScrollBaseComponent;
  let fixture: ComponentFixture<TestNgxMugenScrollBaseComponent>;

  let spyBottomDirective: jasmine.SpyObj<MugenScrollBottomDirective>;
  let spyTopDirective: jasmine.SpyObj<MugenScrollTopDirective>;
  let spyDataDirective: jasmine.SpyObj<MugenScrollDataDirective>;
  let spyProvider: jasmine.SpyObj<DataProvider<TestData>>;

  function setSpy(): void {
    spyBottomDirective = spyOnAllFunctions(component.c?.bottomDirective as MugenScrollBottomDirective);
    spyTopDirective = spyOnAllFunctions(component.c?.topDirective as MugenScrollTopDirective);
    spyDataDirective = spyOnAllFunctions(component.c?.dataDirective as MugenScrollDataDirective);
    spyProvider = spyOnAllFunctions(component.provider);
  }

  describe('Provider 0', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [
          TestNgxMugenScroll0Component,
          NgxMugenScrollComponent,
          MugenScrollTopDirective,
          MugenScrollBottomDirective,
          MugenScrollDataDirective,
        ],
      })
        .compileComponents();
      fixture = TestBed.createComponent(TestNgxMugenScroll0Component);
      component = fixture.componentInstance;
      fixture.detectChanges();
      await fixture.whenRenderingDone();
      setSpy();
    });

    it('saveScrollPosition', () => {
      component.c?.saveScrollPosition();
      expect(component.c?.dataDirective?.top).toBeUndefined();
      expect(component.c?.dataDirective?.bottom).toBeUndefined();
    });
  });

  describe('Provider 100', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [
          TestNgxMugenScroll100Component,
          NgxMugenScrollComponent,
          MugenScrollTopDirective,
          MugenScrollBottomDirective,
          MugenScrollDataDirective,
        ],
      })
        .compileComponents();
      fixture = TestBed.createComponent(TestNgxMugenScroll100Component);
      component = fixture.componentInstance;
      fixture.detectChanges();
      await fixture.whenRenderingDone();
      setSpy();
    });

    it('should create using default config', () => {
      expect(component).toBeTruthy();
      expect(component.c?.scrollBottomOnInit).toBeFalse();
      expect(component.c?.countPerLoadMode).toBe('small');
    });

    it('ngAfterViewInit', async () => {
      await component.c?.ngAfterViewInit();
    });

    it('ngOnChanges to middle', () => {
      component.c?.ngOnChanges(
        {
          countPerLoadMode: new SimpleChange(
            'small',
            'middle',
            true,
          ),
        },
      );
      expect(component.c?.countPerLoad).toBe(50);
    });

    it('ngOnChanges to big', () => {
      component.c?.ngOnChanges(
        {
          countPerLoadMode: new SimpleChange(
            'small',
            'big',
            true,
          ),
        },
      );
      expect(component.c?.countPerLoad).toBe(100);
    });

    it('saveScrollPosition', () => {
      component.c?.saveScrollPosition();
      expect(component.c?.dataDirective?.top).toEqual({ index: 0, name: `id-0` });
      expect(component.c?.dataDirective?.bottom).toEqual({ index: 9, name: `id-9` });
    });
  });

  describe('Provider 100 scroll bottom on init', () => {
    beforeEach(async () => {
      await TestBed.configureTestingModule({
        declarations: [
          TestNgxMugenScroll100ScrollBottomComponent,
          NgxMugenScrollComponent,
          MugenScrollTopDirective,
          MugenScrollBottomDirective,
          MugenScrollDataDirective,
        ],
      })
        .compileComponents();
      fixture = TestBed.createComponent(TestNgxMugenScroll100ScrollBottomComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      await fixture.whenRenderingDone();
      setSpy();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
      expect(component.c?.scrollBottomOnInit).toBeTrue();
      expect(component.c?.countPerLoadMode).toBe('small');
    });
  });
});
