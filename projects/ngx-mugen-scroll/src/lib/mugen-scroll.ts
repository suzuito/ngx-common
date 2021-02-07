import { Cursor } from './cursor';
import { CursorStoreInfo } from './cursor-store.service';

export interface DataProvider<T> {
    scrollId: string;
    fetchBottom(
        cursor: Cursor, n: number, includeEqual: boolean): Promise<Array<T>>;
    fetchTop(
        cursor: Cursor, n: number, includeEqual: boolean): Promise<Array<T>>;
    fetchOnLoad(
        info: CursorStoreInfo): Promise<Array<T>>;
    fetchOnInit(n: number): Promise<Array<T>>;
    newCursor(v: T): Cursor;
}
