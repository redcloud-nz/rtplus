/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /api/users/[userId]/teams
 */

import { NextRequest } from 'next/server'

import { createListResponse } from '@/lib/api/common'
import { validateUUID } from '@/lib/id'
import prisma from '@/lib/server/prisma'



export async function GET(request: NextRequest, props: { params: Promise<{ personId: string }> }) {
    const personId = (await props.params).personId
    
    if(!validateUUID(personId)) return new Response(`Invalid personId (${personId}) in path`, { status: 400 })

    const teamPermissions = await prisma.teamPermission.findMany({
        where: {
            personId
        },
        include: {
            team: true
        },
        orderBy: { team: { name: 'asc' } },
    })


    return createListResponse(teamPermissions.map(permission => permission.team))
}