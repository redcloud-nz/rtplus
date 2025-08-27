import { cache } from 'react'

import prisma from '@/server/prisma'



export const getSessionById = cache(async (sessionId: string) => {
    const session = await prisma.skillCheckSession.findUnique({
        where: { id: sessionId },
        include: { team: true }
    })
    return session
})