
export interface ChangeCounts {
    create: number
    update: number
    delete: number
}
export const EmptyChangeCounts: ChangeCounts = { create: 0, update: 0, delete: 0 }

export type ChangeCountsByType<K extends string> = { readonly [Property in K]: ChangeCounts }

export function createEmptyChangeCounts<K extends string>(keys: K[]): ChangeCountsByType<K> {
    const result = {} as Record<K, ChangeCounts>

    for(const key of keys) {
        result[key] = { ...EmptyChangeCounts }
    }

    return result as ChangeCountsByType<K>
}