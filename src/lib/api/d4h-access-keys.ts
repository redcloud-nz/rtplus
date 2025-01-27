
/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import type { D4hAccessKey, Team } from '@prisma/client'
import { type DefinedUseQueryResult, useQuery } from '@tanstack/react-query'

import { ListResponse } from './common' 


export type D4hAccessKeyWithTeam = D4hAccessKey & { team: Team }


export function useD4hAccessKeysQuery(): DefinedUseQueryResult<D4hAccessKeyWithTeam[]> {
    return useQuery({
        queryKey: ['user', 'd4hAccessKeys'],
        queryFn: async () => {
            const response = await fetch(`/api/users/me/d4h-access-keys`)
            const json = await response.json() as ListResponse<D4hAccessKeyWithTeam>
            return json.data
        },
        initialData: []
    })
}

export function useD4hAccessKeys(): D4hAccessKeyWithTeam[] {
    const query = useD4hAccessKeysQuery()
    return query.data ?? []
}