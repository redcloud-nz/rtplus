
'use client'

import { SkillGroup } from '@prisma/client'
import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { ListResponse } from './common'


export function useSkillGroupsQuery(): UseQueryResult<SkillGroup[]> {
    return useQuery({
        queryKey: ['skill-groups'],
        queryFn: async () => {
            const response = await fetch('/api/skill-groups')
            const json = await response.json() as ListResponse<SkillGroup>
            return json.data
        }
    })
}