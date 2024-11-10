
import { D4hAccessKey } from '@prisma/client'
import prisma from './prisma'

import 'server-only'


export async function getD4hAccessKeys(userId: string): Promise<D4hAccessKey[]> {

    return await prisma.d4hAccessKey.findMany({ where: { userId: userId, enabled: true } })
}