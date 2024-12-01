
import { createListResponse } from '@/lib/api/common'
import prisma from '@/lib/prisma'

export async function GET() {
    
    const skillGroups = await prisma.skillGroup.findMany()

    return Response.json(createListResponse(skillGroups))
}