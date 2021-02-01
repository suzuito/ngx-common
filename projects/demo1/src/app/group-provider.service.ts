import { Injectable } from '@angular/core';
import { Cursor, CursorStoreInfo, DataProvider, OrderedDataStoreIdxService, OrderedDataStoreIdxServiceStore } from 'ngx-mugen-scroll';
import { Group } from './group';

@Injectable({
  providedIn: 'root'
})
export class GroupProviderServiceImplAsc implements DataProvider<Group> {
  static store: OrderedDataStoreIdxServiceStore = {
    name: 'test-group',
    keyPath: ['id'],
    indices: [
      {
        name: 'idx1',
        keyPath: ['name', 'id'],
        unique: true,
      }
    ],
  };
  constructor(
    private base: OrderedDataStoreIdxService,
  ) { }
  async fetchBottom(
    cursor: Cursor, n: number, includeEqual: boolean,
  ): Promise<Array<Group>> {
    return await this.base.getLargerN<Group>(
      GroupProviderServiceImplAsc.store.name,
      'idx1',
      cursor,
      n,
      includeEqual,
    );
  }
  async fetchTop(
    cursor: Cursor, n: number, includeEqual: boolean,
  ): Promise<Array<Group>> {
    return await this.base.getSmallerN<Group>(
      GroupProviderServiceImplAsc.store.name,
      'idx1',
      cursor,
      n,
      includeEqual,
    );
  }
  async fetchOnLoad(
    info: CursorStoreInfo,
  ): Promise<Array<Group>> {
    return await this.base.getLargerN<Group>(
      GroupProviderServiceImplAsc.store.name,
      'idx1',
      info.bottomCursor,
      info.n,
      true,
    );
  }
  async fetchOnInit(n: number): Promise<Array<Group>> {
    return await this.base.getLargerN<Group>(
      GroupProviderServiceImplAsc.store.name,
      'idx1',
      new Cursor([0, '']),
      n,
      true,
    );
  }

  async add(...v: Array<Group>): Promise<void> {
    this.base.add<Group>(GroupProviderServiceImplAsc.store.name, ...v);
  }
}
