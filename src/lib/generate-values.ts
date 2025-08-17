/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

export function createRandomValueGenerator<K extends string>(weights: Record<K, number>): (() => K) {
    const keys = Object.keys(weights) as K[]

    const total = keys.reduce((sum, key) => sum + weights[key], 0)

    let cumulative = 0
    const thresholds = keys.map(key => {
        cumulative += weights[key]
        return { key: key as K, threshold: cumulative / total }
    })


    return () => {
        const random = Math.random()
        for (const { threshold, key } of thresholds) {
            if (random < threshold) {
                return key
            }
        }
        throw new Error('Unreachable')
    }
}


export function randomDate(start: Date, end: Date): string {
    const startTime = start.getTime()
    const endTime = end.getTime()
    const randomTime = Math.floor(Math.random() * (endTime - startTime + 1)) + startTime
    return new Date(randomTime).toISOString().slice(0, 10)
}