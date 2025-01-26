/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /api/teams
 */

import { NextRequest } from 'next/server'

import { auth } from '@clerk/nextjs/server'
import type { Team } from '@prisma/client'

import { createListResponse } from '@/lib/api/common'
import type { TeamWithMembers } from '@/lib/api/teams'
import prisma from '@/lib/server/prisma'


export async function GET(request: NextRequest) {
    await auth.protect()

    const searchParams = request.nextUrl.searchParams
    const includeMembers = searchParams.has('members')

    if(includeMembers) {
        const teams: TeamWithMembers[] = await prisma.team.findMany({
            where: {},
            include: {
                teamMemberships: {
                    include: {
                        person: true,
                        d4hInfo: true
                    },
                    orderBy: {
                        person: {
                            name: 'asc'
                        }
                    }
                },
            },
            orderBy: { name: 'asc' }
        })

        return createListResponse(teams)
        
    } else {
        const teams: Team[] = await prisma.team.findMany({
            orderBy: { name: 'asc' }
        })

        return createListResponse(teams)
    }
}