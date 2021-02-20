import { Injectable } from '@angular/core';
import { Cursor } from './cursor';

export interface CursorStoreInfo {
  bottomCursor: Cursor;
  topCursor: Cursor;
  n: number;
  scrollY: number;
  scrollX: number;
}

@Injectable({
  providedIn: 'root'
})
export class CursorStoreService {

  private store: Map<string, CursorStoreInfo>;

  constructor() {
    this.store = new Map<string, CursorStoreInfo>();
  }

  save(p: string, bottomCursor: Cursor, topCursor: Cursor, n: number, scrollY: number): void {
    this.store.set(p, { bottomCursor, topCursor, n, scrollY, scrollX: 0 });
  }

  load(p: string): CursorStoreInfo | undefined {
    const i = this.store.get(p);
    if (!i) {
      return undefined;
    }
    return i;
  }

  delete(p: string): void {
    this.store.delete(p);
  }

  get length(): number {
    return this.store.size;
  }
}
