
/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import React from 'react'

import type { D4hAccessKey, Team } from '@prisma/client'
import { type DefinedUseQueryResult, useQuery } from '@tanstack/react-query'

import { ListResponse } from './common' 


export type D4hAccessKeyWithTeam = Pick<D4hAccessKey, 'id' | 'key'> & { team: Pick<Team, 'id' | 'name' | 'ref' | 'd4hApiUrl' | 'd4hTeamId'> }


export function useD4hAccessKeysQuery(): DefinedUseQueryResult<D4hAccessKeyWithTeam[]> {
    return useQuery({
        queryKey: ['user', 'd4hAccessKeys'],
        queryFn: async () => {
            const response = await fetch(`/api/user/d4h-access-keys`)
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

export function useTeamNameResolver(accessKeys: D4hAccessKeyWithTeam[]): (d4hTeamId: number) => string {
    return React.useMemo(() => {
        const lookupMap: Record<number, string> = {}
        for(const accessKey of accessKeys) {
            lookupMap[accessKey.team.d4hTeamId] = accessKey.team.ref || accessKey.team.name
        }
        return (d4hTeamId) => lookupMap[d4hTeamId] ?? "Unknown"
    }, [accessKeys])
}