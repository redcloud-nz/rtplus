
import { createListResponse } from '@/lib/api/common'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {

    const personnel = await prisma.person.findMany({
        orderBy: { name: 'asc' }
    })

    return Response.json(createListResponse(personnel))
}