export class Cursor {
    private datas: Array<string | number>;
    constructor(
        datas: Array<string | number>,
        private delimiter: string = '-',
    ) {
        this.datas = datas.map(v => v);
    }
    get length(): number { return this.datas.length; }
    toString(): string {
        return this.datas.join(this.delimiter);
    }
    getItem(i: number): number | string {
        return this.datas[i];
    }
    getItems(): Array<number | string> {
        return this.datas.map(v => v);
    }
}
