/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /api/teams
 */

import { NextRequest } from 'next/server'

import { auth } from '@clerk/nextjs/server'

import { createListResponse } from '@/lib/api/common'
import prisma from '@/lib/prisma'
import { Team } from '@prisma/client'
import type { TeamWithMembers } from '@/lib/api/teams'


export async function GET(request: NextRequest) {
    const { orgId } = await auth.protect()

    const searchParams = request.nextUrl.searchParams
    const includeMembers = searchParams.has('members')

    if(includeMembers) {
        const teams: TeamWithMembers[] = await prisma.team.findMany({
            where: {
                orgId
            },
            include: {
                memberships: {
                    include: {
                        person: true
                    }
                },
            },
            orderBy: { name: 'asc' }
        })

        return Response.json(createListResponse(teams))
        
    } else {
        const teams: Team[] = await prisma.team.findMany({
            orderBy: { name: 'asc' }
        })

        return Response.json(createListResponse(teams))
    }
}