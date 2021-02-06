
export interface Data {
    id: string;
    groupId: string;
    name: string;
    message: string;
    createdAt: number;
}

const nouns = ['bird', 'clock', 'boy', 'plastic', 'duck', 'teacher', 'old lady', 'professor', 'hamster', 'dog'];
const verbs = ['kicked', 'ran', 'flew', 'dodged', 'sliced', 'rolled', 'died', 'breathed', 'slept', 'killed'];
const adjectives = ['beautiful', 'lazy', 'professional', 'lovely', 'dumb', 'rough', 'soft', 'hot', 'vibrating', 'slimy'];
const adverbs = ['slowly', 'elegantly', 'precisely', 'quickly', 'sadly', 'humbly', 'proudly', 'shockingly', 'calmly', 'passionately'];
const preposition = ['down', 'into', 'up', 'on', 'upon', 'below', 'above', 'through', 'across', 'towards'];

function randGen(): number {
    return Math.floor(Math.random() * 5);
}

function sentence(): string {
    const rand1 = Math.floor(Math.random() * 10);
    const rand2 = Math.floor(Math.random() * 10);
    const rand3 = Math.floor(Math.random() * 10);
    const rand4 = Math.floor(Math.random() * 10);
    const rand5 = Math.floor(Math.random() * 10);
    const rand6 = Math.floor(Math.random() * 10);
    const content = 'The ' +
        adjectives[rand1] + ' ' + nouns[rand2] + ' ' +
        adverbs[rand3] + ' ' + verbs[rand4] + ' because some ' +
        nouns[rand1] + ' ' + adverbs[rand1] + ' ' + verbs[rand1] + ' ' +
        preposition[rand1] + ' a ' + adjectives[rand2] + ' ' + nouns[rand5] +
        ' which, became a ' + adjectives[rand3] + ', ' + adjectives[rand4] + ' ' + nouns[rand6] + '.';
    return content;
}


export function generateDatasAtRandom(
    groupId: string,
    n: number,
): Array<Data> {
    const now = Date.now() / 1000;
    const r = [];
    for (let i = 0; i < n; i++) {
        r.push({
            id: `data-${i}-of-group-${groupId}`,
            name: `データ-${i} of グループ ${groupId}`,
            groupId,
            message: sentence(),
            createdAt: now - i * 600,
        });
    }
    return r;
}
