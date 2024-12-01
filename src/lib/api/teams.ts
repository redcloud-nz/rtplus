
'use client'

import { Team } from '@prisma/client'
import { useQuery, UseQueryResult } from '@tanstack/react-query'

import { ListResponse } from './common'


export function useTeamsQuery(): UseQueryResult<Team[]> {
    return useQuery({
        queryKey: ['teams'],
        queryFn: async () => {
            const response = await fetch('/api/teams')
            const json = await response.json() as ListResponse<Team>
            return json.data
        }
    })
}