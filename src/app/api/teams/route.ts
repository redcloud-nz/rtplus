
import prisma from '@/lib/prisma'


export async function GET() {

    const teams = await prisma.team.findMany({})

    return Response.json(teams)
}