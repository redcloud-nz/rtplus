
import prisma from '@/lib/prisma'


export async function GET() {

    const teams = prisma.team.findMany({})

    return Response.json(teams)
}