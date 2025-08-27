/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { createContext, useContext } from 'react'

import { SkillCheckSessionData } from '@/lib/schemas/skill-check-session'


const SessionContext = createContext<SkillCheckSessionData | null>(null)

export function SessionProvider({ children, value }: { children: React.ReactNode, value: SkillCheckSessionData }) {
    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): SkillCheckSessionData {
    const session = useContext(SessionContext)
    if (!session) {
        throw new Error('useSession must be used within a SessionProvider')
    }
    return session
}
