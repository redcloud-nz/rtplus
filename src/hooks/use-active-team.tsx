/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use client'

import { useQuery } from '@tanstack/react-query'

import { TeamData } from '@/lib/schemas/team'
import { useTRPC } from '@/trpc/client'


export function useActiveTeam(): TeamData | null {
    const trpc = useTRPC()
    
    const { data: team } = useQuery(trpc.teams.getActiveTeam.queryOptions())

    return team ?? null
}