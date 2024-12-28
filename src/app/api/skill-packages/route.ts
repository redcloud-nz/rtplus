

import { createListResponse } from '@/lib/api/common'
import prisma from '@/lib/prisma'

export async function GET() {
    
    const packages = await prisma.skillPackage.findMany({
        include: {
            skillGroups: true,
            skills: true
        }
    })

    return Response.json(createListResponse(packages))
}