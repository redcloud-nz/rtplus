
/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

'use client'

import * as React from 'react'

import { Person, Team, TeamMembership, TeamMembershipD4hInfo } from '@prisma/client'
import { useQuery, UseQueryResult } from '@tanstack/react-query'

import type { WithSerializedDates } from '@/lib/serialize'

import { ListResponse, ObjectResponse } from './common'


export type TeamWithMembers = Team & { teamMemberships: TeamMembershipDetails[] }

export type TeamMembershipDetails = TeamMembership & { person: Person, d4hInfo: TeamMembershipD4hInfo | null }


//----------------------------------------//
//               API Functions            //
//----------------------------------------//

export async function fetchTeam(teamId: string): Promise<WithSerializedDates<TeamWithMembers>> {
    const response = await fetch(`/api/teams/${teamId}`)
    const json = await response.json() as ObjectResponse<WithSerializedDates<TeamWithMembers>>
    return json.data
}

export async function fetchTeamMemberships(teamId: string): Promise<WithSerializedDates<TeamMembershipDetails[]>> {
    const response = await fetch(`/api/teams/${teamId}/memberships`)
    const json = await response.json() as ListResponse<WithSerializedDates<TeamMembershipDetails>>
    return json.data
}

export async function fetchTeams(): Promise<WithSerializedDates<Team[]>> {
    const response = await fetch(`/api/teams`)
    const json = await response.json() as ListResponse<WithSerializedDates<Team>>
    return json.data
}


//----------------------------------------//
//               Query Options            //
//----------------------------------------//

export function teamQueryOptions(teamId: string) {
    return {
        queryKey: ['teams', teamId],
        queryFn: () => fetchTeam(teamId)
    }
}

export function teamMembershipsQueryOptions(teamId: string) {
    return {
        queryKey: ['teams', teamId, 'memberships'],
        queryFn: () => fetchTeamMemberships(teamId)
    }
}


//----------------------------------------//
//               Query Hooks              //
//----------------------------------------//

export function useTeamQuery(teamId: string): UseQueryResult<WithSerializedDates<TeamWithMembers[]>> {
    return useQuery(teamQueryOptions(teamId))
}

export function useTeamsQuery(): UseQueryResult<WithSerializedDates<Team[]>> {
    return useQuery({
        queryKey: ['teams'],
        queryFn: async () => fetchTeams()
    })
}

export function useTeamMembershipsQuery(teamId: string): UseQueryResult<WithSerializedDates<TeamMembershipDetails[]>> {
    return useQuery({
        queryKey: ['teams', teamId, 'memberships'],
        queryFn: async () => fetchTeamMemberships(teamId)
    })
}

export function useTeamsWithMembersQuery(): UseQueryResult<WithSerializedDates<TeamWithMembers[]>> {
    
    return useQuery({
        queryKey: ['teams', { members: true }],
        queryFn: async () => {
            const response = await fetch(`/api/teams?members=true`)
            const json = await response.json() as ListResponse<TeamWithMembers>
            return json.data
        }
    })
}


//----------------------------------------//
//               Data Resolvers           //
//----------------------------------------//

export function useTeamNameResolver(): (d4hTeamId: number) => string {
    const teamsQuery = useTeamsQuery()

    return React.useMemo(() => {
        const lookupMap: Record<number, string> = {}
        for(const team of teamsQuery.data ?? []) {
            if(team.d4hTeamId) lookupMap[team.d4hTeamId] = team.shortName || team.name
        }
        return (d4hTeamId) => lookupMap[d4hTeamId] ?? "Unknown"
    }, [teamsQuery.data])
}

