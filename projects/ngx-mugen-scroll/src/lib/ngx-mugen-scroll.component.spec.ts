import { Component, ContentChild, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Cursor } from './cursor';
import { CursorStoreInfo } from './cursor-store.service';
import { DataProvider } from './mugen-scroll';
import { MugenScrollBottomDirective } from './mugen-scroll-bottom.directive';
import { MugenScrollDataDirective } from './mugen-scroll-data.directive';
import { MugenScrollTopDirective } from './mugen-scroll-top.directive';
import { NgxMugenScrollComponent } from './ngx-mugen-scroll.component';

@Component({
  selector: 'lib-test-component',
  template: `
  <lib-ngx-mugen-scroll [provider]='provider'>
      <div libMugenScrollTop></div>
      <div *libMugenScrollData='let data = data'></div>
      <div libMugenScrollBottom></div>
  </lib-ngx-mugen-scroll>`,
})
class TestNgxMugenScrollComponent {
  @ViewChild(NgxMugenScrollComponent)
  public c: NgxMugenScrollComponent | undefined;
  public provider: DataProvider<TestData> = new TestDataProvider();
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
  constructor() {
    this.datas = [];
    for (let i = 0; i < 100; i++) {
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

describe('NgxMugenScrollComponent', () => {
  let component: TestNgxMugenScrollComponent;
  let fixture: ComponentFixture<TestNgxMugenScrollComponent>;

  let spyBottomDirective: jasmine.SpyObj<MugenScrollBottomDirective>;
  let spyTopDirective: jasmine.SpyObj<MugenScrollTopDirective>;
  let spyDataDirective: jasmine.SpyObj<MugenScrollDataDirective>;
  let spyProvider: jasmine.SpyObj<DataProvider<TestData>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TestNgxMugenScrollComponent,
        NgxMugenScrollComponent,
        MugenScrollTopDirective,
        MugenScrollBottomDirective,
        MugenScrollDataDirective,
      ],
    })
      .compileComponents();
  });

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestNgxMugenScrollComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenRenderingDone();
    spyBottomDirective = spyOnAllFunctions(component.c?.bottomDirective as MugenScrollBottomDirective);
    spyTopDirective = spyOnAllFunctions(component.c?.topDirective as MugenScrollTopDirective);
    spyDataDirective = spyOnAllFunctions(component.c?.dataDirective as MugenScrollDataDirective);
    spyProvider = spyOnAllFunctions(component.provider);
  });

  it('should create using default config', () => {
    expect(component).toBeTruthy();
    expect(component.c?.scrollBottomOnInit).toBeFalse();
    expect(component.c?.countPerLoadMode).toBe('small');
  });
});
