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
            id: `group-${i}`,
            name: `グループ-${i}`,
        });
    }
    return r;
}
