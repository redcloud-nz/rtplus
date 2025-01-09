/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /api/teams/[teamId]
 */

import { NextRequest } from 'next/server'

import { auth } from '@clerk/nextjs/server'

import { createNotFoundResponse, createObjectResponse } from '@/lib/api/common'
import prisma from '@/lib/prisma'

import type { TeamWithMembers } from '@/lib/api/teams'

export async function GET(request: NextRequest, props: { params: Promise<{ teamId: string }> }) {
    const { teamId } = await props.params

    const { orgId } = await auth.protect()

    const team: TeamWithMembers | null = await prisma.team.findFirst({
        include: {
            memberships: {
                include: {
                    person: true
                }
            },
        },
        where: {
            id: teamId,
            orgId
        }
    })

    if(team) return createObjectResponse(team)
    else return createNotFoundResponse(`No such Team(${teamId})`)
}