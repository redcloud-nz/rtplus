

import { createListResponse } from '@/lib/api/common'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
    
    const capabilities = await prisma.capability.findMany()

    return Response.json(createListResponse(capabilities))
}