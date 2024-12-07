
import { createListResponse } from '@/lib/api/common'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    
    const skillGroups = await prisma.skillGroup.findMany()

    return Response.json(createListResponse(skillGroups))
}