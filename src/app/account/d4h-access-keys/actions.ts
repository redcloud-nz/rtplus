'use server'

import { revalidatePath } from 'next/cache'

import { currentUser } from '@clerk/nextjs/server'

import prisma from '@/lib/prisma'
import { assertNonNull } from '@/lib/utils'
import * as Paths from '@/paths'

type CreateArgs =  { accessKey: string, teamId: string, d4hTeamId: number }

/**
 * Server Action to create an access key record in the database.
 */
export async function createAccessKey({ accessKey, teamId, d4hTeamId }: CreateArgs) {

    const user = await currentUser()
    if(!user) throw new Error("Must be logged in to execute action 'createAccessKey'")

    const team = await prisma.team.findFirst({
        where: { id: teamId }
    })
    assertNonNull(team, `Missing team record for teamId=${teamId}`)

    // Create the Access Key
    await prisma.d4hAccessKey.create({
        data: { personId: user.publicMetadata.personId, key: accessKey, teamId, enabled: true }
    })

    if(team.d4hTeamId == 0) {
        // Update the D4H Team ID
        await prisma.team.update({
            where: { id: teamId },
            data: { d4hTeamId }
        })
    }

    revalidatePath(Paths.d4hAccessKeys)
}


type UpdateArgs = { accessKeyId: string, enabled: boolean }

/**
 * Server Action to update an access key record in the database.
 */
export async function updateAccessKey({ accessKeyId, enabled }: UpdateArgs) {
    const user = await currentUser()
    if(!user) throw new Error("Must be logged in to execute action 'updateAccessKey'")


    await prisma.d4hAccessKey.update({
        where: { id: accessKeyId, personId: user.publicMetadata.personId },
        data: { enabled }
    })
}


type DeleteArgs = { accessKeyId: string }

/**
 * Server Action to delete an access key record from the database.
 */
export async function deleteAccessKey({ accessKeyId }: DeleteArgs) {
    const user = await currentUser()
    if(!user) throw new Error("Must be logged in to execute action 'deleteAccessKey'")

    await prisma.d4hAccessKey.delete({
        where: { id: accessKeyId, personId: user.publicMetadata.personId }
    })

    revalidatePath(Paths.d4hAccessKeys)
}