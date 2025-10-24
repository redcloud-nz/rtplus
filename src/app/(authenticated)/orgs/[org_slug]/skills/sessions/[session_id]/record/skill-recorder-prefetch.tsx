/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { trpc } from '@/trpc/client'
import { useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'

export function SkillRecorder_Session_Prefetch({ sessionId }: { sessionId: string }) {

    const queryClient = useQueryClient()

    useEffect(() => {
        Promise.all([
            queryClient.prefetchQuery(trpc.skills.getAvailablePackages.queryOptions({ })),
            queryClient.prefetchQuery(trpc.skillChecks.getSessionAssignedAssessees.queryOptions({ sessionId })),
            queryClient.prefetchQuery(trpc.skillChecks.getSessionAssignedAssessors.queryOptions({ sessionId })),
            queryClient.prefetchQuery(trpc.skillChecks.getSessionAssignedSkillIds.queryOptions({ sessionId })),
        ])
    }, [queryClient, sessionId])

    return null
}