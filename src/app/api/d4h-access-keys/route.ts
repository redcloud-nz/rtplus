
import { currentUser } from '@clerk/nextjs/server'

import { createListResponse } from '@/lib/api/common'
import type { D4hAccessKeyWithTeam } from '@/lib/api/d4h-access-keys'
import prisma from '@/lib/prisma'


export async function GET() {
    const user = await currentUser()
    if(!user) return Response.error()

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
        where: { personId: user.publicMetadata.personId, enabled: true } 
    })

    return Response.json(createListResponse(accessKeys))
}