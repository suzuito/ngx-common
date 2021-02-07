import { AfterViewInit, Component, OnInit } from '@angular/core';
import { Cursor, CursorStoreInfo, CursorStoreService, OrderedDataStoreIdxService } from 'ngx-mugen-scroll';

interface Data {
  createdAt: number;
  message: string;
}

class Provider {
  scrollId = 'demo1';
  private at: number;
  constructor() {
    this.at = Date.now() / 1000;
  }
  newCursor(data: Data): Cursor {
    return new Cursor([data.createdAt]);
  }
  async fetchBottom(cursor: Cursor, n: number, includeEqual: boolean): Promise<Array<Data>> {
    const r = [];
    for (let i = 0; i < n; i++) {
      r.push({ message: 'hello', createdAt: (cursor.getItem(0) as number) - i });
    }
    return r;
  }
  async fetchTop(cursor: Cursor, n: number, includeEqual: boolean): Promise<Array<Data>> {
    const r = [];
    for (let i = 0; i < n; i++) {
      r.push({ message: 'hello', createdAt: (cursor.getItem(0) as number) + i });
    }
    return r;
  }
  async fetchOnLoad(info: CursorStoreInfo): Promise<Array<Data>> {
    const r = [];
    for (let i = 0; i < info.n; i++) {
      r.push({ message: 'hello', createdAt: (info.bottomCursor.getItem(0) as number) + i });
    }
    return r;
  }
  async fetchOnInit(n: number): Promise<Array<Data>> {
    return await this.fetchBottom(
      this.newCursor({ createdAt: Date.now() / 1000, message: '' }),
      n,
      true,
    );
  }
}

@Component({
  selector: 'app-demo1',
  templateUrl: './demo1.component.html',
  styleUrls: ['./demo1.component.scss']
})
export class Demo1Component implements OnInit, AfterViewInit {

  public provider: Provider;

  constructor(
    base: OrderedDataStoreIdxService,
    cursorStoreService: CursorStoreService,
  ) {
    this.provider = new Provider();
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
  }

}
