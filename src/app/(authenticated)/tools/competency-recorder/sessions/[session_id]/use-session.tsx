/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { createContext, useContext } from 'react'

import { SkillCheckSessionData } from '@/lib/schemas/skill-check-session'
import { TeamData } from '@/lib/schemas/team'

type UseSessionReturn = SkillCheckSessionData & { team: TeamData }

const SessionContext = createContext<UseSessionReturn | null>(null)

export function SessionProvider({ children, value }: { children: React.ReactNode, value: UseSessionReturn }) {
    return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession(): UseSessionReturn {
    const session = useContext(SessionContext)
    if (!session) {
        throw new Error('useSession must be used within a SessionProvider')
    }
    return session
}
