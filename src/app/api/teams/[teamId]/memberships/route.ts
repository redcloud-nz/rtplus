/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /api/teams/[teamId]/memberships
 */

import { NextRequest } from 'next/server'

import { createListResponse } from '@/lib/api/common'
import { TeamMembershipDetails } from '@/lib/api/teams'
import prisma from '@/server/prisma'


export async function GET(request: NextRequest, props: { params: Promise<{ teamId: string }> }) {
    const { teamId } = await props.params

    const members: TeamMembershipDetails[] = await prisma.teamMembership.findMany({
        include: {
            person: true,
            d4hInfo: true
        },
        where: {
            teamId,
        },
        orderBy: {
            person: { name: 'asc' }
        }
    })

    return createListResponse(members)
}