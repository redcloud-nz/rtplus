/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /api/teams/[teamId]
 */

import { notFound } from 'next/navigation'
import { NextRequest } from 'next/server'

import { auth } from '@clerk/nextjs/server'

import { createObjectResponse } from '@/lib/api/common'
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
    }) ?? notFound()

    return Response.json(createObjectResponse(team))
}