/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 *  Path: /api/user/d4h-access-keys
 */

import { auth } from '@clerk/nextjs/server'

import { createListResponse } from '@/lib/api/common'
import type { D4hAccessKeyWithTeam } from '@/lib/api/d4h-access-keys'
import prisma from '@/lib/prisma'


export async function GET() {
    const { orgId, userId } = await auth.protect()

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
        where: { orgId, userId, enabled: true } 
    })

    return createListResponse(accessKeys)
}