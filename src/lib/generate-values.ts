/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { entries, fromEntries, keys, sumBy } from 'remeda'

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

type DateString = string

interface WeightedDateRange { start: Date, end: Date, weight: number }

export function createRandomDateGenerator(ranges: WeightedDateRange[]): () => DateString {
    const total = sumBy(ranges, range => range.weight)

    let cumulative = 0
    const thresholds = ranges.map(range => {
        cumulative += range.weight
        return { start: range.start, end: range.end, threshold: cumulative / total }
    })

    return () => {
        const random = Math.random()
        for (const { threshold, start, end } of thresholds) {
            if (random < threshold) {
                return randomDate(start, end)
            }
        }
        throw new Error('Unreachable')
    }
}

export function randomDate(start: Date, end: Date): DateString {
    const startTime = start.getTime()
    const endTime = end.getTime()
    const randomTime = Math.floor(Math.random() * (endTime - startTime + 1)) + startTime
    return new Date(randomTime).toISOString().slice(0, 10) as DateString
}