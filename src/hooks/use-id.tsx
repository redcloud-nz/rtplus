/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { nanoId16, nanoId8 } from "@/lib/id"
import { useMemo } from "react"


export function useNanoId8() {
    return useMemo(() => nanoId8(), [])
}

export function useNanoId16() {
    return useMemo(() => nanoId16(), [])
}