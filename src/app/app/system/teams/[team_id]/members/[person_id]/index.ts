/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /app/system/teams/[team_id]/members/[person_id]
 */


import { notFound } from 'next/navigation'
import { cache } from 'react'

import prisma from '@/server/prisma'
import { TeamMembershipWithPersonAndTeam } from '@/trpc/types'


export interface TeamMembershipParams { person_id: string, team_id: string }

export const getTeamMembership = cache(async (params: Promise<TeamMembershipParams>): Promise<TeamMembershipWithPersonAndTeam> => {
    const { person_id: personId, team_id: teamId } = await params
    const membership = await prisma.teamMembership.findUnique({
        where: { personId_teamId: { personId, teamId } },
        include: { person: true, team: true }
    })

    return membership ?? notFound()
})