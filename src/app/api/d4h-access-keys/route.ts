
import { auth } from '@clerk/nextjs/server'

import { createListResponse } from '@/lib/api/common'
import type { D4hAccessKeyWithTeam } from '@/lib/api/d4h-access-keys'
import prisma from '@/lib/prisma'


export async function GET() {
    const { userId } = await auth.protect({ permission: 'org:d4h:personal_access' })

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
        where: { userId, enabled: true } 
    })

    return Response.json(createListResponse(accessKeys))
}