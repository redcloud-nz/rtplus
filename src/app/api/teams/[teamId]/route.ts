/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /api/teams/[teamId]
 */

import { NextRequest } from 'next/server'

import { auth } from '@clerk/nextjs/server'

import { createObjectResponse } from '@/lib/api/common'
import prisma from '@/lib/prisma'

import type { TeamWithMembers } from '@/lib/api/teams'

export async function GET(request: NextRequest, props: { params: Promise<{ teamId: string }> }) {
    const params = await props.params;

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
            id: params.teamId,
            orgId
        }
    })

    if(team) return Response.json(createObjectResponse(team))
    else return new Response(`Team (${params.teamId}) not found.`, { status: 404 })
}