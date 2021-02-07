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
RndText.prototype.getString = function (langCode) {
    langCode = langCode || 'en';
    var lang = this.strCodes[langCode], result = [];
    if (this.checkType('Array', lang)) {
        var i = 0, length = lang.length;
        for (; i < length; i += 1) {
            result.push(String.fromCharCode(Math.floor(Math.random() * (lang[i].end - lang[i].start + 1) + lang[i].start)));
        }
        result = result[Math.floor(Math.random() * result.length)].replace(/\s/g, '');
    } else {
        result = String.fromCharCode(Math.floor(Math.random() * (lang.end - lang.start + 1)));
    }
    return result.toString();
};

RndText.prototype.getStrings = function (langCode, length) {
    length = length || 1;
    var i = 0, result = [];
    for (; i < length; i += 1) {
        result.push(this.getString(langCode));
    }
    return result.join('');
};
*/
