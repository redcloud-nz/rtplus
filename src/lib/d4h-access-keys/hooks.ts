'use client'

import React from 'react'

import { useQuery } from '@tanstack/react-query'

import { D4hAccessKeyWithTeam } from './index'


export function useD4hAccessKeys(): D4hAccessKeyWithTeam[] {

    const query = useQuery({
        queryKey: ['d4hAccessKeys'],
        queryFn: async () => {
            const response = await fetch('/api/d4h-access-keys')
            return await response.json() as D4hAccessKeyWithTeam[]
        }
    })

    return query.data ?? []
}

export function useTeamNameResolver(accessKeys: D4hAccessKeyWithTeam[]): (d4hTeamId: number) => string {

    return React.useMemo(() => {
        const lookupMap: Record<number, string> = {}
        for(const accessKey of accessKeys) {
            lookupMap[accessKey.team.d4hTeamId] = accessKey.team.code || accessKey.team.name
        }
        return (d4hTeamId) => lookupMap[d4hTeamId] ?? "Unknown"
    }, [accessKeys])
}