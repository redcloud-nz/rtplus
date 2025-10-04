/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { trpc } from '@/trpc/client'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

export function SkillRecorder_Session_Prefetch({ sessionId, teamId }: { sessionId: string, teamId: string }) {

    const queryClient = useQueryClient()

    useEffect(() => {
        Promise.all([
            queryClient.prefetchQuery(trpc.skills.getAvailablePackages.queryOptions({ teamId })),
            queryClient.prefetchQuery(trpc.skillChecks.getSessionAssessees.queryOptions({ sessionId })),
            queryClient.prefetchQuery(trpc.skillChecks.getSessionAssessors.queryOptions({ sessionId })),
            queryClient.prefetchQuery(trpc.skillChecks.getSessionSkillIds.queryOptions({ sessionId })),
        ])
    }, [queryClient, sessionId, teamId])

    return null
}