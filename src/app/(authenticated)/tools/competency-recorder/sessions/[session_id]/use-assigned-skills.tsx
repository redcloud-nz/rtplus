/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useSuspenseQuery } from '@tanstack/react-query'

import { useTRPC } from '@/trpc/client'
import { useMemo } from 'react'


export function useAssignedSkills({ sessionId }: { sessionId: string }) {
    const trpc = useTRPC()

    const { data: availablePackages } = useSuspenseQuery(trpc.skills.getAvailablePackages.queryOptions())
    const { data: assignedSkillIds } = useSuspenseQuery(trpc.skillCheckSessions.getAssignedSkillIds.queryOptions({ sessionId  }))

   const assignedSkills = useMemo(() => {
       return availablePackages.flatMap(pkg => 
            pkg.skillGroups.flatMap(skillGroup => 
                pkg.skills.filter(skill => skill.skillGroupId == skillGroup.skillGroupId && assignedSkillIds.includes(skill.skillId))
            )
       )
    }, [availablePackages, assignedSkillIds])

   return { data: assignedSkills }
}