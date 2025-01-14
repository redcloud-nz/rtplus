/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

export interface ChangeCounts {
    create: number
    update: number
    delete: number
}
export const EmptyChangeCounts: ChangeCounts = { create: 0, update: 0, delete: 0 }

export type ChangeCountsByType<K extends string> = { readonly [Property in K]: ChangeCounts }

export function createChangeCounts<K extends string>(keys: K[]): ChangeCountsByType<K> {
    const result = {} as Record<K, ChangeCounts>

    for(const key of keys) {
        result[key] = { ...EmptyChangeCounts }
    }

    return result as ChangeCountsByType<K>
}

export function mergeChangeCounts<K extends string>(accumulator: ChangeCountsByType<K>, other: ChangeCountsByType<K>) {
    
    for(const key of Object.keys(accumulator) as K[]) {
        accumulator[key].create += other[key].create
        accumulator[key].update += other[key].update
        accumulator[key].delete += other[key].delete
    }
}

export function changeCountsToString(changeCounts: ChangeCounts) {
    return `${changeCounts.create} created, ${changeCounts.update} updated, ${changeCounts.delete} deleted.`
}