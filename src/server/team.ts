/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
import 'server-only'

import { cacheTag, revalidateTag } from 'next/cache'
import { notFound } from 'next/navigation'

import { TeamData, toTeamData } from '@/lib/schemas/team'

import prisma from './prisma'

export async function getTeam(orgId: string, teamId: string): Promise<TeamData> {
    'use cache'
    cacheTag(`team-${teamId}`)

    // Fetch team record
    const team = await prisma.team.findFirst({
        where: { orgId, teamId }
    })

    if(!team) return notFound()

    return toTeamData(team)
}

export async function revalidateTeam(teamId: string) {
    revalidateTag(`team-${teamId}`, { expire: 0 })
}