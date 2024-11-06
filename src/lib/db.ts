
import prisma from './prisma'

import 'server-only'


export async function getD4hAccessKeys(userId: string) {

    return await prisma.d4hAccessKey.findMany({ where: { userId: userId, enabled: true } })
}