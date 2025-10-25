/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useEffect } from 'react'

import { useQueryClient } from '@tanstack/react-query'

import { OrganizationId } from '@/lib/schemas/organization'
import { trpc } from '@/trpc/client'

export function SkillRecorder_Session_Prefetch({ orgId, sessionId }: { orgId: OrganizationId, sessionId: string }) {

    const queryClient = useQueryClient()

    useEffect(() => {
        Promise.all([
            queryClient.prefetchQuery(trpc.skills.getAvailablePackages.queryOptions({ orgId })),
            queryClient.prefetchQuery(trpc.skillChecks.getSessionAssignedAssessees.queryOptions({ orgId, sessionId })),
            queryClient.prefetchQuery(trpc.skillChecks.getSessionAssignedAssessors.queryOptions({ orgId, sessionId })),
            queryClient.prefetchQuery(trpc.skillChecks.getSessionAssignedSkillIds.queryOptions({ orgId, sessionId })),
        ])
    }, [queryClient, orgId, sessionId])

    return null
}