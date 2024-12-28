'use server'

import { revalidatePath } from 'next/cache'

import { auth } from '@clerk/nextjs/server'

import prisma from '@/lib/prisma'
import { assertNonNull } from '@/lib/utils'
import * as Paths from '@/paths'

type CreateArgs =  { accessKey: string, teamId: string, d4hTeamId: number }

/**
 * Server Action to create an access key record in the database.
 */
export async function createAccessKey({ accessKey, teamId, d4hTeamId }: CreateArgs) {

    const { userId, orgId } = await auth.protect()
    assertNonNull(orgId, "An active organization is required to execute 'createAccessKey")

    const team = await prisma.team.findFirst({
        where: { id: teamId, orgId  }
    })
    assertNonNull(team, `Missing team record for teamId=${teamId}`)

    // Create the Access Key
    await prisma.d4hAccessKey.create({
        data: { orgId, userId, key: accessKey, teamId, enabled: true }
    })

    if(team.d4hTeamId == 0) {
        // Update the D4H Team ID
        await prisma.team.update({
            where: { id: teamId },
            data: { d4hTeamId }
        })
    }
    revalidatePath(Paths.account.d4hAccessKeys)
}


type UpdateArgs = { accessKeyId: string, enabled: boolean }

/**
 * Server Action to update an access key record in the database.
 */
export async function updateAccessKey({ accessKeyId, enabled }: UpdateArgs) {

    const { userId } = await auth.protect()

    await prisma.d4hAccessKey.update({
        where: { id: accessKeyId, userId },
        data: { enabled }
    })
}


type DeleteArgs = { accessKeyId: string }

/**
 * Server Action to delete an access key record from the database.
 */
export async function deleteAccessKey({ accessKeyId }: DeleteArgs) {

    const { userId } = await auth.protect()

    await prisma.d4hAccessKey.delete({
        where: { id: accessKeyId, userId }
    })

    revalidatePath(Paths.account.d4hAccessKeys)
}