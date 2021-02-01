export interface Group {
    id: string;
    name: string;
}


export async function generateGroupsAtRandom(
    n: number,
): Promise<void> {
    const store = new GroupProviderServiceImplAsc(base);
    for (let i = 0; i < n; i++) {
        await store.add({
            id: `group-${i}`,
            name: `グループ-${i}`,
        });
    }
}