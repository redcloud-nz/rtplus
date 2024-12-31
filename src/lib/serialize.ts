/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import _ from 'lodash'

export type WithSerializedDates<T> = 
    T extends Date ? string
    : T extends Array<infer R> ? Array<WithSerializedDates<R>>
    : T extends object ? { [K in keyof T]: WithSerializedDates<T[K]> }
    : T


export function withSerializedDates<T>(input: T): WithSerializedDates<T> {
    return (input instanceof Date ? input.toISOString()
        : Array.isArray(input) ? _.map(input, withSerializedDates)
        : typeof input == 'object' ? _.mapValues(input, withSerializedDates)
        : input) as WithSerializedDates<T>
}

