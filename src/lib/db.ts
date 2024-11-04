
import { getSession } from '@auth0/nextjs-auth0'

import prisma from '@/lib/prisma'

import { getUserId } from './utils'

export async function getD4hAccessKeys() {
    const session = await getSession()
    const userId = getUserId(session)

    return await prisma.d4hAccessKey.findMany({ where: { userId: userId, enabled: true } })
}