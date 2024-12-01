
'use client'

import { Capability } from '@prisma/client'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { ListResponse } from './common'


export function useCapabilitiesQuery(): UseQueryResult<Capability[]> {
    return useQuery({
        queryKey: ['capabilities'],
        queryFn: async () => {
            const response = await fetch('/api/capabilities')
            const json = await response.json() as ListResponse<Capability>
            return json.data
        }
    })
}