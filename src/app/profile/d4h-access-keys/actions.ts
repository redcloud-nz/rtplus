'use server'

import { revalidatePath } from 'next/cache'

import { currentUser } from '@clerk/nextjs/server'

import prisma from '@/lib/prisma'




type CreateArgs =  { key: string, label: string, memberId: number, teamName: string, teamId: number, primary: boolean }

/**
 * Server Action to create an access key record in the database.
 */
export async function createAccessKey({ key, label, primary }: CreateArgs) {

    const user = await currentUser()
    if(!user) throw new Error("Must be logged in to execute action 'createAccessKey'")

    if(primary) {
        // This new key will become the primary so we need to mark all of the old ones as not primary
        prisma.d4hAccessKey.updateMany({
            where: { personId: user.publicMetadata.personId, primary: true },
            data: { primary: false }
        })
    }

    await prisma.d4hAccessKey.create({
        data: { personId: user.publicMetadata.personId, key, label, teamId: "", primary, enabled: true }
    })

    revalidatePath('/settings/d4h-access-keys')
}


type UpdateArgs = { id: string, label: string, primary: boolean, enabled: boolean }

/**
 * Server Action to update an access key record in the database.
 */
export async function updateAccessKey({ id, label, primary, enabled }: UpdateArgs) {
    const user = await currentUser()
    if(!user) throw new Error("Must be logged in to execute action 'updateAccessKey'")

    if(primary) {
        // This key will become the primary so we need to mark all others as not primary
        prisma.d4hAccessKey.updateMany({
            where: { personId: user.publicMetadata.personId, primary: true },
            data: { primary: false }
        })
    }

    await prisma.d4hAccessKey.update({
        where: { id, personId: user.publicMetadata.personId },
        data: { label, primary, enabled }
    })

    revalidatePath('/settings/d4h-access-keys')
}


type DeleteArgs = { id: string }

/**
 * Server Action to delete an access key record from the database.
 */
export async function deleteAccessKey({ id }: DeleteArgs) {
    const user = await currentUser()
    if(!user) throw new Error("Must be logged in to execute action 'deleteAccessKey'")

    await prisma.d4hAccessKey.delete({
        where: { id, personId: user.publicMetadata.personId }
    })

    revalidatePath('/settings/d4h-access-keys')
}