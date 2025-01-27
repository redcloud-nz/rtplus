/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /api/users/[personId]/d4h-access-keys
 */

import { NextRequest } from 'next/server'

import { createListResponse } from '@/lib/api/common'
import type { D4hAccessKeyWithTeam } from '@/lib/api/d4h-access-keys'

import { validateUUID } from '@/lib/id'
import prisma from '@/lib/server/prisma'




export async function GET(request: NextRequest, props: { params: Promise<{ personId: string }> }) {
    const { personId } = await props.params

    if(!validateUUID(personId)) return new Response(`Invalid personId (${personId}) in path`, { status: 400 })

    const accessKeys: D4hAccessKeyWithTeam[] = await prisma.d4hAccessKey.findMany({
        include: { team: true },
        where: { ownerId: personId, enabled: true } 
    })

    return createListResponse(accessKeys)
}