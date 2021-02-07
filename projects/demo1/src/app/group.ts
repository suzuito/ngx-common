export interface Group {
    id: string;
    name: string;
}


export function generateGroupsAtRandom(
    n: number,
): Array<Group> {
    const r = [];
    for (let i = 0; i < n; i++) {
        r.push({
            id: `group-${10000 + i}`,
            name: `グループ-${10000 + i}`,
        });
    }
    return r;
}
