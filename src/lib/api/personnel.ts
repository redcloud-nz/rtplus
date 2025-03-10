
'use client'

import { Person } from '@prisma/client'
import { useQuery, UseQueryResult } from '@tanstack/react-query'
import { ListResponse } from './common'

const personnelQueryOptions = {
    queryKey: ['personnel'],
    queryFn: async () => {
        const response = await fetch('/api/personnel')
        const json = await response.json() as ListResponse<Person>
        return json.data
    }
}

export function usePersonnelQuery(): UseQueryResult<Person[]> {
    return useQuery(personnelQueryOptions)
}