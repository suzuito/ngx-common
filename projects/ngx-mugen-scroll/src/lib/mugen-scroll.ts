import { Subject, Subscription } from 'rxjs';
import { Cursor } from './cursor';
import { CursorStoreInfo, CursorStoreService } from './cursor-store.service';

export interface DataProvider<T> {
    fetchBottom(
        cursor: Cursor, n: number, includeEqual: boolean): Promise<Array<T>>;
    fetchTop(
        cursor: Cursor, n: number, includeEqual: boolean): Promise<Array<T>>;
    fetchOnLoad(
        info: CursorStoreInfo): Promise<Array<T>>;
    fetchOnInit(n: number): Promise<Array<T>>;
    newCursor(v: T): Cursor;
}

export function generateCallbackIntersectionObserverDefault(
    bottom: {
        el: HTMLElement,
        on: () => void,
    },
    top: {
        el: HTMLElement,
        on: () => void,
    },
    millisecondsEdgeDetecterInit: number,
): (entities: Array<IntersectionObserverEntry>) => void {
    function a(entries: Array<IntersectionObserverEntry>): void {
        const now = Date.now();
        for (const entry of entries) {
            if (now - millisecondsEdgeDetecterInit <= 1000) {
                continue;
            }
            if (entry.target === bottom.el && entry.isIntersecting) {
                console.log(`onBottom: `, entry);
                bottom.on();
            }
            if (entry.target === top.el && entry.isIntersecting) {
                console.log(`onTop   : `, entry);
                top.on();
            }
        }
    }
    return a;
}

export interface MugenScrollOption {
    waitTimeMilliSeconds: number;
    fetchLength: number;
    maxLength: number;
    threshold: number;
}

export interface MugenScrollLoadOption {
    initScrollBottom: boolean;
}

function def(e: HTMLElement | undefined): HTMLElement {
    if (!e) {
        throw new Error(`element is undefined`);
    }
    return e;
}

export type CallbackIntersectionObserverGenerator = (
    bottom: {
        el: HTMLElement,
        on: () => void,
    },
    top: {
        el: HTMLElement,
        on: () => void,
    },
    millisecondsEdgeDetecterInit: number,
) =>
    (entities: Array<IntersectionObserverEntry>) => void;

export interface MugenScrollEvent {
    type: 'onBottom' | 'onTop';
}

export class MugenScroll<T> {

    public datas: Array<T>;
    private dupChecker: Map<string, boolean>;

    private observerScrollingVisibility: IntersectionObserver | undefined;

    private internalElParent: HTMLElement | undefined;
    private internalElBottom: HTMLElement | undefined;
    private internalElTop: HTMLElement | undefined;

    public isLoading: boolean;

    private callbackIntersectionObserverGenerator: CallbackIntersectionObserverGenerator;
    private opt: MugenScrollOption;

    public event: Subject<MugenScrollEvent>;

    constructor(
        private streamProvider: DataProvider<T>,
        private streamCursorStore: CursorStoreService,
        opt?: MugenScrollOption | undefined,
        callbackIntersectionObserverGenerator?: CallbackIntersectionObserverGenerator | undefined,
    ) {
        if (opt === undefined) {
            this.opt = {
                waitTimeMilliSeconds: 500,
                fetchLength: 20,
                maxLength: 50,
                threshold: 1.0,
            }; // default
        } else {
            this.opt = opt;
        }
        if (callbackIntersectionObserverGenerator === undefined) {
            this.callbackIntersectionObserverGenerator = generateCallbackIntersectionObserverDefault;
        } else {
            this.callbackIntersectionObserverGenerator = callbackIntersectionObserverGenerator;
        }
        this.datas = [];
        this.dupChecker = new Map<string, boolean>();
        this.isLoading = false;
        if (this.opt.fetchLength >= this.opt.maxLength) {
            throw new Error(`Invalid length: ${this.opt.fetchLength} ${this.opt.maxLength}`);
        }
        this.event = new Subject<MugenScrollEvent>();
    }

    key(v: T): string {
        return this.streamProvider.newCursor(v).toString();
    }

    initElements(a: {
        elParent: HTMLElement,
        elBottom: HTMLElement,
        elTop: HTMLElement,
    }): void {
        this.internalElParent = a.elParent;
        this.internalElBottom = a.elBottom;
        this.internalElTop = a.elTop;
    }

    save(uniqId: string): void {
        const bottomData = this.bottomData();
        const topData = this.topData();
        if (!bottomData) {
            return;
        }
        if (!topData) {
            return;
        }
        this.streamCursorStore.save(
            uniqId,
            this.streamProvider.newCursor(bottomData),
            this.streamProvider.newCursor(topData),
            this.datas.length,
            def(this.internalElParent).scrollTop,
        );
    }

    async load(uniqId: string, loadopt: MugenScrollLoadOption): Promise<void> {
        if (this.isLoading) {
            return;
        }
        const i = this.streamCursorStore.load(uniqId);
        let scrollTop: number | null = null;
        let fetcher: Promise<Array<T>> | null = null;
        this.isLoading = true;
        if (i) {
            fetcher = this.streamProvider.fetchOnLoad(i);
            scrollTop = i.scrollTop;
        } else {
            fetcher = this.streamProvider.fetchOnInit(this.opt.fetchLength);
        }
        await fetcher
            .then(v => this.addDatasToTop(...v))
            .then(() => {
                if (scrollTop === null) {
                    if (loadopt.initScrollBottom) {
                        const bottomData = this.bottomData();
                        if (!bottomData) {
                            return;
                        }
                        this.scrollTo(this.scrollTopAtBottom(this.streamProvider.newCursor(bottomData).toString()));
                        return;
                    }
                    return;
                }
                this.scrollTo(scrollTop);
            })
            .catch(err => console.error(err))
            .finally(() => {
                this.isLoading = false;
            })
            ;
    }

    getCursorStoreInfo(uniqId: string): CursorStoreInfo | undefined {
        return this.streamCursorStore.get(uniqId);
    }

    async fetchTop(): Promise<void> {
        if (this.isLoading) {
            return;
        }
        this.isLoading = true;
        const topDataBeforeFetch = this.topData();
        if (!topDataBeforeFetch) {
            this.isLoading = false;
            throw new Error(`topDataBeforeFetch is undefined`);
        }
        await this.streamProvider.fetchTop(this.streamProvider.newCursor(topDataBeforeFetch), this.opt.fetchLength, false)
            .then(v => this.addDatasToTop(...v))
            .then(v => {
                if (v.length <= 0) {
                    return;
                }
                if (!topDataBeforeFetch) {
                    return;
                }
                this.scrollTo(this.scrollTopAtTop(this.streamProvider.newCursor(topDataBeforeFetch).toString()));
            })
            .then(() => new Promise(resolve => {
                setTimeout(resolve, this.opt.waitTimeMilliSeconds);
            }))
            .finally(() => {
                this.isLoading = false;
                console.log('isLoading to false');
            });
    }

    async fetchBottom(): Promise<void> {
        if (this.isLoading) {
            return;
        }
        this.isLoading = true;
        const bottomDataBeforeFetch = this.bottomData();
        if (!bottomDataBeforeFetch) {
            this.isLoading = false;
            throw new Error(`bottomDataBeforeFetch is undefined`);
        }
        await this.streamProvider.fetchBottom(this.streamProvider.newCursor(bottomDataBeforeFetch), this.opt.fetchLength, false)
            .then(v => this.addDatasToBottom(...v))
            .then(v => {
                if (v.length <= 0) {
                    return;
                }
                if (!bottomDataBeforeFetch) {
                    return;
                }
                this.scrollTo(this.scrollTopAtBottom(this.streamProvider.newCursor(bottomDataBeforeFetch).toString()));
            })
            .then(() => new Promise(resolve => {
                setTimeout(resolve, this.opt.waitTimeMilliSeconds);
            }))
            .finally(() => {
                this.isLoading = false;
                console.log('isLoading to false');
            });
    }

    initEdgeDetector(): void {
        if (this.observerScrollingVisibility) {
            return;
        }
        this.observerScrollingVisibility = new IntersectionObserver(
            this.callbackIntersectionObserverGenerator(
                {
                    el: def(this.internalElBottom),
                    on: (): void => {
                        this.event.next({
                            type: 'onBottom',
                        });
                    },
                },
                {
                    el: def(this.internalElTop),
                    on: () => {
                        this.event.next({
                            type: 'onTop',
                        });
                    },
                },
                Date.now(),
            ),
            {
                root: this.internalElParent,
                rootMargin: '0px',
                threshold: this.opt.threshold,
            },
        );
        if (this.internalElBottom) {
            this.observerScrollingVisibility.observe(this.internalElBottom);
        }
        if (this.internalElTop) {
            this.observerScrollingVisibility.observe(this.internalElTop);
        }
    }

    destroyEdgeDetector(): void {
        if (this.observerScrollingVisibility) {
            this.observerScrollingVisibility.disconnect();
            this.observerScrollingVisibility = undefined;
        }
    }

    private isUpdated(): boolean {
        const d: HTMLElement = def(this.internalElParent);
        let count = 0;
        for (let i = 0; i < d.children.length; i++) {
            const item = d.children.item(i);
            if (!item) {
                continue;
            }
            if (item.getAttribute('key')) {
                count++;
            }
        }
        if (count !== this.dupChecker.size) {
            return false;
        }
        for (const keyString of Array.from(this.dupChecker.keys())) {
            let ok = false;
            for (let i = 0; i < d.children.length; i++) {
                const child = d.children.item(i);
                if (!child) {
                    continue;
                }
                const attrKeyString = child.getAttribute('key');
                if (attrKeyString === keyString) {
                    ok = true;
                    break;
                }
            }
            if (!ok) {
                return false;
            }
        }
        return true;
    }

    private filterDuplicate(...items: Array<T>): Array<T> {
        const added: Array<T> = [];
        for (const v of items) {
            if (this.dupChecker.has(this.streamProvider.newCursor(v).toString())) {
                continue;
            }
            added.push(v);
        }
        return added;
    }

    private addDuplicate(...itemKeys: Array<string>): void {
        for (const v of itemKeys) {
            this.dupChecker.set(v, true);
        }
    }

    private removeDuplicate(...itemKeys: Array<string>): void {
        for (const v of itemKeys) {
            this.dupChecker.delete(v);
        }
    }

    private async addDatasToBottom(...items: Array<T>): Promise<Array<T>> {
        if (items.length <= 0) {
            return Promise.resolve([]);
        }
        const added = this.filterDuplicate(...items);
        if (added.length <= 0) {
            return [];
        }
        return new Promise<Array<T>>((resolve, reject) => {
            const observer = new MutationObserver((mutations: Array<MutationRecord>) => {
                if (!this.isUpdated()) {
                    return;
                }
                console.log('Updated');
                observer.disconnect();
                resolve(added);
            });
            observer.observe(def(this.internalElParent), { childList: true });
            this.datas.push(...added);
            this.addDuplicate(...added.map(v => this.streamProvider.newCursor(v).toString()));
            if (this.datas.length > this.opt.maxLength) {
                for (let i = 0; i < this.datas.length - this.opt.maxLength; i++) {
                    const shifted = this.datas.shift();
                    if (!shifted) {
                        continue;
                    }
                    this.removeDuplicate(this.streamProvider.newCursor(shifted).toString());
                }
            }
        });
    }

    private async addDatasToTop(...items: Array<T>): Promise<Array<T>> {
        if (items.length <= 0) {
            return [];
        }
        const added = this.filterDuplicate(...items);
        if (added.length <= 0) {
            return [];
        }
        return new Promise<Array<T>>((resolve, reject) => {
            const observer = new MutationObserver((mutations: Array<MutationRecord>, _) => {
                if (!this.isUpdated()) {
                    return;
                }
                observer.disconnect();
                resolve(added);
            });
            observer.observe(def(this.internalElParent), { childList: true });
            this.datas.unshift(...added);
            this.addDuplicate(...added.map(v => this.streamProvider.newCursor(v).toString()));
            if (this.datas.length > this.opt.maxLength) {
                for (let i = 0; i < this.datas.length - this.opt.maxLength; i++) {
                    const poped = this.datas.pop();
                    if (!poped) {
                        continue;
                    }
                    this.removeDuplicate(this.streamProvider.newCursor(poped).toString());
                }
            }
        });
    }

    async clearDatas(): Promise<void> {
        if (this.datas.length <= 0) {
            return;
        }
        return new Promise<void>((resolve, reject) => {
            const observer = new MutationObserver((mutations: Array<MutationRecord>, _) => {
                const d: HTMLElement = def(this.internalElParent);
                let count = 0;
                for (let i = 0; i < d.children.length; i++) {
                    const item = d.children.item(i);
                    if (!item) {
                        continue;
                    }
                    if (item.getAttribute('key')) {
                        count++;
                    }
                }
                if (count > 0) {
                    return;
                }
                observer.disconnect();
                resolve();
            });
            observer.observe(def(this.internalElParent), { childList: true });
            this.dupChecker.clear();
            this.datas = [];
        });
    }

    topData(): T | undefined {
        if (this.datas.length <= 0) {
            return undefined;
        }
        return this.datas[0];
    }

    bottomData(): T | undefined {
        if (this.datas.length <= 0) {
            return undefined;
        }
        return this.datas[this.datas.length - 1];
    }

    private scrollTopAtTop(targetKey: string): number {
        let s = 0;
        const root: HTMLElement = def(this.internalElParent);
        for (let i = 0; i < root.children.length; i++) {
            const e: HTMLElement = root.children.item(i) as HTMLElement;
            const attr = e.attributes.getNamedItem('key');
            if (!attr) {
                continue;
            }
            if (attr.value === targetKey) {
                break;
            }
            s += e.offsetHeight;
        }
        return s;
    }

    private scrollTopAtBottom(targetKey: string): number {
        let s = 0;
        const root: HTMLElement = def(this.internalElParent);
        for (let i = 0; i < root.children.length; i++) {
            const e: HTMLElement = root.children.item(i) as HTMLElement;
            const attr = e.attributes.getNamedItem('key');
            if (!attr) {
                continue;
            }
            s += e.offsetHeight;
            if (attr.value === targetKey) {
                break;
            }
        }
        const p: HTMLElement = def(this.internalElParent);
        s -= p.offsetHeight;
        s += this.heightStreamPaddingTop();
        s += this.heightStreamPaddingBottom();
        return s;
    }

    private scrollTo(s: number): void {
        const p: HTMLElement = def(this.internalElParent);
        p.scrollTo({ top: s });
    }

    private heightStreamPaddingBottom(): number {
        const root: HTMLElement = def(this.internalElParent);
        let s = 0;
        for (let i = 0; i < root.children.length; i++) {
            const e: HTMLElement = root.children.item(i) as HTMLElement;
            if (e !== this.internalElBottom) {
                continue;
            }
            s += e.offsetHeight;
        }
        return s;
    }

    private heightStreamPaddingTop(): number {
        const root: HTMLElement = def(this.internalElParent);
        let s = 0;
        for (let i = 0; i < root.children.length; i++) {
            const e: HTMLElement = root.children.item(i) as HTMLElement;
            if (e !== this.internalElTop) {
                continue;
            }
            s += e.offsetHeight;
        }
        return s;
    }

    isBottom(): boolean {
        if (!this.observerScrollingVisibility) {
            return false;
        }
        if (!this.internalElParent) {
            return false;
        }
        return this.internalElParent.offsetHeight + this.internalElParent.scrollTop >= this.internalElParent.scrollHeight;
    }

    isTop(): boolean {
        if (!this.observerScrollingVisibility) {
            return false;
        }
        if (!this.internalElParent) {
            return false;
        }
        return this.internalElParent.scrollTop <= 0;
    }
}
