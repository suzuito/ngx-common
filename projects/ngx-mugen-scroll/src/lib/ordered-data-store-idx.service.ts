import { Injectable } from '@angular/core';
import { Cursor } from './cursor';


export class NotFoundResourceError implements Error {
  readonly name: string;
  constructor(public message: string) {
    this.name = this.constructor.name;
  }
}

export interface OrderedDataStoreIdxServiceIndex {
  name: string;
  keyPath: string | Array<string>;
  unique: boolean;
}

export interface OrderedDataStoreIdxServiceStore {
  name: string;
  keyPath: string | Array<string>;
  indices: Array<OrderedDataStoreIdxServiceIndex>;
}

@Injectable({
  providedIn: 'root'
})
export class OrderedDataStoreIdxService {

  private indexedDB: IDBFactory;
  private db: IDBDatabase | undefined;
  private dbName: string;

  constructor(
  ) {
    this.dbName = 'ngx-mugen-scroll-store';
    this.indexedDB = window.indexedDB;
  }

  static async fetch<T>(
    base: OrderedDataStoreIdxService,
    store: OrderedDataStoreIdxServiceStore,
    key: string,
    index: string,
    fetcher: () => Promise<T>,
  ): Promise<T> {
    let data = await base.get<T>(
      store.name,
      key,
      index,
    );
    if (data) {
      console.log(`Fetch ${store.name}.${index}.${key} from indexed db`);
      return data;
    }
    data = await fetcher();
    if (!data) {
      throw new NotFoundResourceError(`Cannot find '${key}'`);
    }
    console.log(`Fetch ${store.name}.${index}.${key} from remote`);
    await base.add(
      store.name,
      data,
    );
    return data;
  }

  private validDB(): IDBDatabase {
    if (!this.db) {
      throw new Error('db is undefined');
    }
    return this.db;
  }


  async init(version: number, stores: Array<OrderedDataStoreIdxServiceStore>): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const request = this.indexedDB.open(this.dbName, version);
      request.onsuccess = (ev: Event) => {
        this.db = (ev.target as any).result as IDBDatabase;
        resolve();
      };
      request.onupgradeneeded = async (ev: Event) => {
        this.db = (ev.target as any).result as IDBDatabase;
        const db = this.db;
        const resultsInitStore: Array<Promise<void>> = [];
        stores.forEach(async store => {
          resultsInitStore.push(initStore(db, store.name, store.keyPath, store.indices));
        });
        for (const result of resultsInitStore) {
          await result;
        }
        resolve();
      };
      request.onblocked = (ev: Event) => {
        console.error(ev);
        reject(ev);
      };
      request.onerror = (ev: Event) => {
        console.error(ev);
        reject(ev);
      };
    });
  }

  async add<T>(storeName: string, ...args: Array<T>): Promise<void> {
    const db = this.validDB();
    const tx = validTx(db, storeName, 'readwrite');
    args.forEach((arg: T) => {
      tx.objectStore(storeName).put(arg);
    });
  }

  async get<T>(
    storeName: string,
    query: IDBKeyRange | IDBValidKey,
    index: string = '',
  ): Promise<T | undefined> {
    return new Promise<T>((resolve, reject) => {
      const db = this.validDB();
      const tx = validTx(db, storeName, 'readonly');
      const store = tx.objectStore(storeName);
      let idx = null;
      if (index) {
        idx = store.index(index);
      } else {
        idx = store;
      }
      const r = idx.get(query);
      r.onsuccess = (ev: Event) => {
        resolve(r.result);
      };
      r.onerror = (ev: Event) => {
        reject(r.error);
      };
    });
  }

  async delete(
    storeName: string,
    key: IDBKeyRange | IDBValidKey,
    index: string = '',
  ): Promise<void> {
    const db = this.validDB();
    const tx = validTx(db, storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    if (!index) {
      return new Promise<void>((resolve, reject) => {
        const r = store.delete(key);
        r.onsuccess = (ev: Event) => {
          resolve();
        };
        r.onerror = (ev: Event) => {
          reject();
        };
      });
    }
    const idx = store.index(index);
    const key2 = idx.getKey(key);
    if (!key2) {
      return;
    }
    return new Promise<void>((resolve, reject) => {
      key2.onsuccess = (ev: Event) => {
        const target = ev.target as any;
        this.delete(storeName, target.result, '').then(resolve).catch(reject);
      };
      key2.onerror = (ev: Event) => { reject(ev); };
    });
  }

  async clear(storeName: string): Promise<void> {
    const db = this.validDB();
    const tx = validTx(db, storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const r = store.clear();
    return new Promise((resolve, reject) => {
      r.onsuccess = (ev: Event) => {
        resolve();
      };
      r.onerror = (ev: Event) => {
        reject();
      };
    });
  }

  async clearAll(): Promise<void> {
    const db = this.validDB();
    const objectStoreNames = db.objectStoreNames;
    for (let i = 0; i < objectStoreNames.length; i++) {
      const objectStoreName = objectStoreNames.item(i);
      if (!objectStoreName) {
        continue;
      }
      await this.clear(objectStoreName);
    }
  }

  async getLargerN<T>(
    storeName: string,
    indexName: string,
    current: Cursor,
    n: number,
    includeEqual: boolean = false,
    end: Cursor | null = null,
    order: 'asc' | 'desc' = 'asc',
  ): Promise<Array<T>> {
    let range = IDBKeyRange.lowerBound(current.getItems(), !includeEqual);
    if (end) {
      range = IDBKeyRange.bound(
        current.getItems(),
        end.getItems(),
        !includeEqual,
        true,
      );
    }
    return await this.iter<T>(
      storeName,
      indexName,
      current.getItems(),
      range,
      'next',
      n,
      order,
    );
  }

  async getSmallerN<T>(
    storeName: string,
    indexName: string,
    current: Cursor,
    n: number,
    includeEqual: boolean = false,
    end: Cursor | null = null,
    order: 'asc' | 'desc' = 'asc',
  ): Promise<Array<T>> {
    let range = IDBKeyRange.upperBound(current.getItems(), !includeEqual);
    if (end) {
      range = IDBKeyRange.bound(
        end.getItems(),
        current.getItems(),
        true,
        !includeEqual,
      );
    }
    return await this.iter<T>(
      storeName,
      indexName,
      current.getItems(),
      range,
      'prev',
      n,
      order,
    );
  }

  private async iter<T>(
    storeName: string,
    indexName: string,
    current: Array<string | number>,
    range: IDBKeyRange,
    direction: 'next' | 'prev',
    n: number,
    order: 'asc' | 'desc' = 'asc',
  ): Promise<Array<T>> {
    // console.log(`Fetch ${storeName}.${indexName} at ${current.toString()}`);
    // console.log(`From ${range.lower} to ${range.upper} sort ${direction} ${n} from indexed db`);
    const ret: Array<T> = [];
    return new Promise<Array<T>>((resolve, reject) => {
      const db = this.validDB();
      const tx = validTx(db, storeName, 'readonly');
      let i = 0;
      const r = tx.objectStore(storeName).index(indexName).openCursor(range, direction);
      r.onsuccess = (ev: Event) => {
        const cursor: IDBCursorWithValue = (ev.target as any).result;
        if (!cursor) {
          // EOF
          if (order === 'desc') {
            ret.reverse();
          }
          resolve(ret);
          return;
        }
        if (i >= n) {
          if (order === 'desc') {
            ret.reverse();
          }
          resolve(ret);
          return;
        }
        if (direction === 'next') {
          ret.push(cursor.value);
        } else {
          ret.unshift(cursor.value);
        }
        cursor.continue();
        i++;
      };
      r.onerror = (ev: Event) => {
        reject(ev);
      };
    });
  }

  public async filter<T>(
    storeName: string,
    direction: 'next' | 'prev',
    cb: (v: T, i: number) => boolean,
  ): Promise<Array<T>> {
    console.log(`Filter ${storeName} from indexed db`);
    const ret: Array<T> = [];
    return new Promise<Array<T>>((resolve, reject) => {
      const db = this.validDB();
      const tx = validTx(db, storeName, 'readonly');
      const r = tx.objectStore(storeName).getAll();
      let i = 0;
      r.onsuccess = (ev: Event) => {
        const r2 = ev.target as IDBRequest;
        (r2.result as Array<T>).forEach((v: T) => {
          if (cb(v, i)) {
            if (direction === 'next') {
              ret.push(v);
            } else {
              ret.unshift(v);
            }
          }
        });
        i++;
        resolve(ret);
      };
      r.onerror = (ev: Event) => {
        reject(ev);
      };
    });
  }
}

async function initStore(
  db: IDBDatabase,
  storeName: string,
  keyPath: string | Array<string>,
  indecies: Array<OrderedDataStoreIdxServiceIndex> = [],
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    if (db.objectStoreNames.contains(storeName)) {
      return resolve();
    }
    const store = db.createObjectStore(
      storeName,
      {
        keyPath,
      },
    );
    indecies.forEach(v => {
      store.createIndex(
        v.name,
        v.keyPath,
        {
          unique: v.unique,
        },
      );
    });
    store.transaction.oncomplete = (ev: Event) => {
      resolve();
    };
    store.transaction.onabort = (ev: Event) => {
      reject(ev);
    };
    store.transaction.onerror = (ev: Event) => {
      reject(ev);
    };
  });

}


function validTx(db: IDBDatabase, storeName: string, mode?: 'readonly' | 'readwrite' | 'versionchange' | undefined): IDBTransaction {
  const tx = db.transaction(storeName, mode);
  if (!tx) {
    throw new Error(`Cannot get transaction '${storeName}'`);
  }
  return tx;
}
