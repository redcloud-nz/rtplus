/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useMemo, useState } from 'react'

export type StatusOptions = {
    showActive: boolean
    showInactive: boolean
}

export const DefaultStatusOptions: StatusOptions = {
    showActive: true,
    showInactive: true,
}

export function useListOptions<T extends {} = {}>(defaultOptions: Partial<StatusOptions> & T): UseListOptionsReturn<StatusOptions & T> {
    const [options, setOptions] = useState<StatusOptions & T>({
        ...DefaultStatusOptions,
        ...defaultOptions,
    })

    const result = useMemo(() => ({
        options,
        setOption: (key, value) => {
            setOptions((prev) => ({ ...prev, [key]: value }))
        },
        handleOptionChange: <K extends keyof (StatusOptions & T)>(key: K) => (value: (StatusOptions & T)[K]) => {
            setOptions((prev) => ({ ...prev, [key]: value }))
        },
    } satisfies UseListOptionsReturn<StatusOptions & T>), [options])

    return result
}

export type UseListOptionsReturn<T> = {
    options: StatusOptions
    setOption: (key: keyof T, value: T[keyof T]) => void
    handleOptionChange: <K extends keyof T>(key: K) => (value: T[K]) => void
}