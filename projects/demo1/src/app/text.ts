function getRndInteger(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min)) + min;
}

export class RndText {
    private texts: Array<string>;
    private lang: Array<{ start: number, end: number }>;
    constructor() {
        this.texts = [];
        this.lang = [
            { // hiragana
                start: 0x3041,
                end: 0x309f
            },
            { // katakana
                start: 0x30a0,
                end: 0x30ff
            },
            { // cjk
                start: 0x4e00,
                end: 0x9fcf
            }
        ];
    }
    private generateChar(): Array<string> {
        const result: Array<string> = [];
        this.lang.forEach(l => {
            result.push(
                String.fromCharCode(
                    Math.floor(Math.random() * (l.end - l.start + 1) + l.start),
                ),
            );
        });
        return result;
    }
    generateString(): void {
        const n = getRndInteger(10, 300);
        let ret = '';
        for (let i = 0; i < n; i++) {
            const chars = this.generateChar();
            const j = getRndInteger(0, chars.length);
            ret += chars[j];
        }
        this.texts.push(ret);
    }
    generateStrings(): void {
        const n = 1000;
        for (let i = 0; i < n; i++) {
            this.generateString();
        }
    }
    getText(i: number): string {
        const j = Math.floor(i) % this.texts.length;
        return this.texts[j];
    }
}

export const rndText = new RndText();
rndText.generateStrings();

/*
*/
