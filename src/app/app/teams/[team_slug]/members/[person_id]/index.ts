/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */

import { notFound } from 'next/navigation'
import { cache } from 'react'

import prisma from '@/server/prisma'


export interface TeamMemberParams { team_slug: string, person_id: string }

export const getTeamMember = cache(async (params: Promise<TeamMemberParams>) => {
    const { team_slug: teamSlug, person_id: personId } = await params

    const teamMember = await prisma.teamMembership.findFirst({
        where: {
            team: { slug: teamSlug },
            personId
        },
        include: {
            person: true,
            team: true
        }
    })

    return teamMember ?? notFound()
})