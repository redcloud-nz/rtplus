/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /api/user/visible-teams
 */

import { NextRequest } from 'next/server'

import { auth } from '@clerk/nextjs/server'
import { Team } from '@prisma/client'

import { createListResponse } from '@/lib/api/common'
import prisma from '@/lib/prisma'


export async function GET(request: NextRequest) {
    const { sessionClaims } = await auth.protect()

    const teams: Team[] = await prisma.team.findMany({
        orderBy: { name: 'asc' }
    })

    return createListResponse(teams)
}