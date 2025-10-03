/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useSuspenseQueries} from '@tanstack/react-query'

import { SkillData } from '@/lib/schemas/skill'
import { trpc } from '@/trpc/client'
import type { RouterOutput } from '@/trpc/routers/_app'


/**
 * Hook to get the skills assigned to a competency recorder session.
 * @param sessionId The ID of the competency recorder session.
 * @returns The assigned skills.
 */
export function useAssignedSkillsQuery({ sessionId, teamId }: { sessionId: string, teamId: string }) {

    return useSuspenseQueries({
        queries: [
            trpc.skills.getAvailablePackages.queryOptions({ teamId }),
            trpc.skillChecks.getSessionSkillIds.queryOptions({ sessionId })
        ],
        combine: ([availablePackagesQuery, assignedSkillIdsQuery]) => {
            return {
                data: getAssignedSkills(availablePackagesQuery.data, assignedSkillIdsQuery.data),
                refetch: () => Promise.all([
                    availablePackagesQuery.refetch(),
                    assignedSkillIdsQuery.refetch()
                ])
            }
        }
    })
}


export function getAssignedSkills(availablePackages: RouterOutput['skills']['getAvailablePackages'], assignedSkillIds: RouterOutput['skillChecks']['getSessionSkillIds']): SkillData[] {
    return availablePackages.flatMap(pkg => 
        pkg.skillGroups.flatMap(skillGroup => 
            pkg.skills.filter(skill => skill.skillGroupId == skillGroup.skillGroupId && assignedSkillIds.includes(skill.skillId))
        )
    )
}