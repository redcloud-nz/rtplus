/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /api/users/[personId]/d4h-access-keys
 */

import { NextRequest } from 'next/server'

import { createListResponse } from '@/lib/api/common'
import type { D4hAccessKeyWithTeam } from '@/lib/api/d4h-access-keys'
import prisma from '@/lib/prisma'
import { validateUUID } from '@/lib/id'



export async function GET(request: NextRequest, props: { params: Promise<{ personId: string }> }) {
    const { personId } = await props.params

    if(!validateUUID(personId)) return new Response(`Invalid personId (${personId}) in path`, { status: 400 })

    const accessKeys: D4hAccessKeyWithTeam[] = await prisma.d4hAccessKey.findMany({
        select: { 
            id: true,
            key: true,
            team: {
                select: { 
                    id: true,
                    name: true,
                    ref: true,
                    d4hApiUrl: true,
                    d4hTeamId: true
                }

            }
        },
        where: { ownerId: personId, enabled: true } 
    })

    return createListResponse(accessKeys)
}