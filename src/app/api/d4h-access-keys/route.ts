
import { currentUser } from '@clerk/nextjs/server'

import { D4hAccessKeyWithTeam } from '@/lib/d4h-access-keys'
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
                    code: true,
                    d4hApiUrl: true,
                    d4hTeamId: true
                }

            }
        },
        where: { personId: user.publicMetadata.personId, enabled: true } 
    })

    return Response.json(accessKeys)
}