/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import * as R from 'remeda'

export type WithSerializedDates<T> = 
    T extends Date ? string
    : T extends Array<infer R> ? Array<WithSerializedDates<R>>
    : T extends object ? { [K in keyof T]: WithSerializedDates<T[K]> }
    : T


export function withSerializedDates<T>(input: T): WithSerializedDates<T> {
    return R.conditional(
        [R.isDate, value => value.toISOString()],
        [R.isArray, R.map(withSerializedDates)],
        [R.isObjectType, R.mapValues(withSerializedDates)],
        R.conditional.defaultCase(x => x)
    )(input) as WithSerializedDates<T>
}

