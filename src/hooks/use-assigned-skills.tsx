/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useSuspenseQuery } from '@tanstack/react-query'

import { useTRPC } from '@/trpc/client'
import { useMemo } from 'react'


/**
 * Hook to get the skills assigned to a competency recorder session.
 * @param sessionId The ID of the competency recorder session.
 * @returns The assigned skills.
 */
export function useAssignedSkills({ sessionId }: { sessionId: string }) {
    const trpc = useTRPC()

    const availablePackagesQuery = useSuspenseQuery(trpc.skills.getAvailablePackages.queryOptions())
    const assignedSkillIdsQuery = useSuspenseQuery(trpc.skillCheckSessions.getAssignedSkillIds.queryOptions({ sessionId  }))

   const assignedSkills = useMemo(() => {
       return availablePackagesQuery.data.flatMap(pkg => 
            pkg.skillGroups.flatMap(skillGroup => 
                pkg.skills.filter(skill => skill.skillGroupId == skillGroup.skillGroupId && assignedSkillIdsQuery.data.includes(skill.skillId))
            )
       )
    }, [availablePackagesQuery.data, assignedSkillIdsQuery.data])

   return { 
        data: assignedSkills,
        refetch: () => Promise.all([
            availablePackagesQuery.refetch(),
            assignedSkillIdsQuery.refetch()
        ])
    }
}