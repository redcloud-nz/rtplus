
'use client'

import '@/lib/serialize'

import { Person, Team, TeamMembership } from '@prisma/client'
import { useQuery, UseQueryResult } from '@tanstack/react-query'

import type { WithSerializedDates } from '@/lib/serialize'


import { ListResponse, ObjectResponse } from './common'

export type TeamWithMembers = Team & { memberships: (TeamMembership & { person: Person })[]}

export function useTeamsQuery(): UseQueryResult<WithSerializedDates<Team[]>> {
    return useQuery({
        queryKey: ['teams'],
        queryFn: async () => {
            const response = await fetch(`/api/teams`)
            const json = await response.json() as ListResponse<Team>
            return json.data
        }
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

export function teamQueryOptions(teamId: string) {
    return {
        queryKey: ['teams', teamId],
        queryFn: async () => {
            const response = await fetch(`/api/teams/${teamId}`)
            const json = await response.json() as ObjectResponse<WithSerializedDates<TeamWithMembers>>
            return json.data
        }
    }
}

export function useTeamQuery(teamId: string): UseQueryResult<WithSerializedDates<TeamWithMembers[]>> {
    return useQuery(teamQueryOptions(teamId))
}