import { Injectable } from '@angular/core';
import { Cursor } from './cursor';

export interface CursorStoreInfo {
  bottomCursor: Cursor;
  topCursor: Cursor;
  n: number;
  scrollTop: number;
}

@Injectable({
  providedIn: 'root'
})
export class CursorStoreService {

  private store: Map<string, CursorStoreInfo>;

  constructor() {
      this.store = new Map<string, CursorStoreInfo>();
  }

  save(p: string, bottomCursor: Cursor, topCursor: Cursor, n: number, scrollTop: number): void {
      // console.log(`Save cursor: ${p}, ${bottomCursor.toString()}, ${topCursor.toString()}, ${n}, ${scrollTop}`);
      this.store.set(p, { bottomCursor, topCursor, n, scrollTop });
  }

  load(p: string): CursorStoreInfo | undefined {
      const i = this.store.get(p);
      if (!i) {
          return undefined;
      }
      // console.log(`Load cursor: ${p}, ${i.bottomCursor.toString()}, ${i.topCursor.toString()}, ${i.n}, ${i.scrollTop}`);
      return i;
  }

  delete(p: string): void {
      this.store.delete(p);
  }

  get(p: string): CursorStoreInfo | undefined {
      return this.store.get(p);
  }
}
