/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use client'

import { type QueryClient} from '@tanstack/react-query'

import { type SkillCheckSessionData } from '@/lib/schemas/skill-check-session'

import { useTRPC } from '@/trpc/client'

interface SkillCheckSessionUpdater {
    updateSession: (session: SkillCheckSessionData) => void;
}

/**
 * Hook to update the skill check session in the query cache.
 * 
 * @param queryClient - The query client instance to use for updating the cache.
 * @returns A function that updates the skill check session in the cache.
 */
export function useSkillCheckSessionUpdater(queryClient: QueryClient): SkillCheckSessionUpdater {
    const trpc = useTRPC()

    return {
        updateSession: (session: SkillCheckSessionData) => {
            queryClient.setQueryData(trpc.skillCheckSessions.getSession.queryKey({ sessionId: session.sessionId }), session)

            queryClient.setQueryData(trpc.skillCheckSessions.getMySessions.queryKey(), (prev = []) => prev.map(s => s.sessionId === session.sessionId ? session : s))
            queryClient.setQueryData(trpc.activeTeam.skillCheckSessions.getTeamSessions.queryKey(), (prev = []) => prev.map(s => s.sessionId === session.sessionId ? session : s))
        }
    }
}