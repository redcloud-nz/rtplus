/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { createContext, ReactNode } from 'react'


const UserContext = createContext<unknown>(undefined)

export function UserProvider({ children }: { children: ReactNode }) {
    return <UserContext.Provider value={undefined}>{children}</UserContext.Provider>
}