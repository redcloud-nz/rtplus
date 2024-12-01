
import { createListResponse } from '@/lib/api/common'
import prisma from '@/lib/prisma'


export async function GET() {

    const teams = await prisma.team.findMany()

    return Response.json(createListResponse(teams))
}