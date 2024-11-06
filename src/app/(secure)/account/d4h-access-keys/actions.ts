'use server'

import { revalidatePath } from 'next/cache'

import { getUserSession } from '@/lib/get-user-session'
import prisma from '@/lib/prisma'



type CreateArgs =  { key: string, label: string, memberId: number, teamName: string, teamId: number, primary: boolean }

/**
 * Server Action to create an access key record in the database.
 */
export async function createAccessKey({ key, label, memberId, teamName, teamId, primary }: CreateArgs) {

    const { userId } = await getUserSession()

    if(primary) {
        // This new key will become the primary so we need to mark all of the old ones as not primary
        prisma.d4hAccessKey.updateMany({
            where: { userId, primary: true },
            data: { primary: false }
        })
    }

    await prisma.d4hAccessKey.create({
        data: { userId, key, label, memberId, teamName, teamId, primary, enabled: true }
    })

    revalidatePath('/~/d4h-access-keys')
}


type UpdateArgs = { id: string, label: string, primary: boolean, enabled: boolean }

/**
 * Server Action to update an access key record in the database.
 */
export async function updateAccessKey({ id, label, primary, enabled }: UpdateArgs) {
    const { userId } = await getUserSession()

    if(primary) {
        // This key will become the primary so we need to mark all others as not primary
        prisma.d4hAccessKey.updateMany({
            where: { userId, primary: true },
            data: { primary: false }
        })
    }

    await prisma.d4hAccessKey.update({
        where: { id, userId },
        data: { label, primary, enabled }
    })

    revalidatePath('/~/d4h-access-keys')
}


type DeleteArgs = { id: string }

/**
 * Server Action to delete an access key record from the database.
 */
export async function deleteAccessKey({ id }: DeleteArgs) {
    const { userId } = await getUserSession()

    await prisma.d4hAccessKey.delete({
        where: { id, userId }
    })

    revalidatePath('/~/d4h-access-keys')
}