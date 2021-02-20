import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Cursor, CursorStoreInfo, CursorStoreService, NgxMugenScrollComponent, OrderedDataStoreIdxService } from 'ngx-mugen-scroll';
import { SnackbarLoggerService } from '../snackbar-logger.service';
import { rndText } from '../text';

interface Data {
  index: number;
  message: string;
}

function getDataAtRandom(index: number): Data {
  return {
    message: rndText.getText(index),
    index,
  };
}

class Provider {
  constructor(public scrollId: string) {
  }
  newCursor(data: Data): Cursor {
    return new Cursor([data.index]);
  }
  async fetchBottom(cursor: Cursor, n: number, includeEqual: boolean): Promise<Array<Data>> {
    const r: Array<Data> = [];
    for (let i = 0; i < n; i++) {
      if (includeEqual === false && i === 0) {
        continue;
      }
      r.push(getDataAtRandom((cursor.getItem(0) as number) + i));
    }
    return r;
  }
  async fetchTop(cursor: Cursor, n: number, includeEqual: boolean): Promise<Array<Data>> {
    const r = [];
    for (let i = 0; i < n; i++) {
      if (includeEqual === false && i === 0) {
        continue;
      }
      const index = (cursor.getItem(0) as number) - i;
      if (index < 0) {
        break;
      }
      r.unshift(getDataAtRandom(index));
    }
    return r;
  }
  async fetchOnLoad(info: CursorStoreInfo): Promise<Array<Data>> {
    const r = [];
    for (let i = 0; i < info.n; i++) {
      r.push(getDataAtRandom((info.bottomCursor.getItem(0) as number) + i));
    }
    return r;
  }
  async fetchOnInit(n: number): Promise<Array<Data>> {
    return await this.fetchBottom(
      this.newCursor({ index: 0, message: '' }),
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

  public provider1: Provider;
  public provider2: Provider;

  @ViewChild('mugenScroll2')
  public mugenScroll2: NgxMugenScrollComponent | undefined;

  @ViewChild('mugenScroll1')
  public mugenScroll1: NgxMugenScrollComponent | undefined;

  constructor(
    public logger: SnackbarLoggerService,
  ) {
    this.provider1 = new Provider('stream1');
    this.provider2 = new Provider('stream2');
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if (this.mugenScroll1 !== undefined) {
      this.mugenScroll1.bottom.subscribe(() => {
        this.logger.info('Fetch bottom');
      });
    }
  }

  clickReadMoreTop2(): void {
    this.mugenScroll2?.fetchTop();
  }

  clickReadMoreBottom2(): void {
    this.mugenScroll2?.fetchBottom();
  }
}
