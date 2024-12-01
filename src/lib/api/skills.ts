
'use client'

import { Skill } from '@prisma/client'
import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { ListResponse } from './common'


export function useSkillsQuery(): UseQueryResult<Skill[]> {
    return useQuery({
        queryKey: ['skills'],
        queryFn: async () => {
            const response = await fetch('/api/skills')
            const json = await response.json() as ListResponse<Skill>
            return json.data
        }
    })
}