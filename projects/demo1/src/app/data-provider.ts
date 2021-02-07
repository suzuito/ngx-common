import {
    Cursor,
    CursorStoreInfo,
    DataProvider,
    OrderedDataStoreIdxServiceStore,
    OrderedDataStoreIdxService,
} from 'ngx-mugen-scroll';
import { Data } from './data';

export class DataProviderImplAsc implements DataProvider<Data> {
    static store: OrderedDataStoreIdxServiceStore = {
        name: 'test-data',
        keyPath: ['id'],
        indices: [
            {
                name: 'idx1',
                keyPath: ['groupId', 'createdAt', 'name'],
                unique: true,
            },
        ],
    };
    public currentGroupId: string;
    constructor(
        private base: OrderedDataStoreIdxService,
    ) {
        this.currentGroupId = '';
    }
    get scrollId(): string {
        return `datas-of-${this.currentGroupId}`;
    }
    newCursor(v: Data): Cursor {
        return new Cursor([v.groupId, v.createdAt, v.id]);
    }
    async fetchBottom(
        cursor: Cursor, n: number, includeEqual: boolean,
    ): Promise<Array<Data>> {
        return await this.base.getLargerN<Data>(
            DataProviderImplAsc.store.name,
            'idx1',
            cursor,
            n,
            includeEqual,
            new Cursor([this.currentGroupId, 999999999999, '']),
        );
    }
    async fetchTop(
        cursor: Cursor, n: number, includeEqual: boolean,
    ): Promise<Array<Data>> {
        return await this.base.getSmallerN<Data>(
            DataProviderImplAsc.store.name,
            'idx1',
            cursor,
            n,
            includeEqual,
            new Cursor([this.currentGroupId, 0, '']),
        );
    }
    async fetchOnLoad(
        info: CursorStoreInfo,
    ): Promise<Array<Data>> {
        console.log(info);
        return await this.base.getLargerN<Data>(
            DataProviderImplAsc.store.name,
            'idx1',
            info.topCursor,
            info.n,
            true,
            info.bottomCursor,
        );
    }
    async fetchOnInit(n: number): Promise<Array<Data>> {
        if (this.currentGroupId === undefined) {
            return [];
        }
        return await this.base.getSmallerN<Data>(
            DataProviderImplAsc.store.name,
            'idx1',
            new Cursor([this.currentGroupId, Date.now() / 1000, '']),
            n,
            true,
            new Cursor([this.currentGroupId, 0, '']),
        );
    }

    async add(...v: Array<Data>): Promise<void> {
        this.base.add<Data>(DataProviderImplAsc.store.name, ...v);
    }
}
