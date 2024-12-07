
import { createListResponse } from '@/lib/api/common'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    
    const skills = await prisma.skill.findMany()

    return Response.json(createListResponse(skills))
}