/*
 *  Copyright (c) 2024 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use server'

import { revalidatePath } from 'next/cache'

import prisma from '@/lib/server/prisma'
import { authenticated } from '@/lib/server/auth'
import { assertNonNull } from '@/lib/utils'
import * as Paths from '@/paths'


type CreateArgs =  { accessKey: string, teamId: string, d4hTeamId: number }

/**
 * Server Action to create an access key record in the database.
 */
export async function createAccessKey({ accessKey, teamId, d4hTeamId }: CreateArgs) {

    const { userPersonId } = await authenticated()

    const team = await prisma.team.findFirst({
        where: { id: teamId }
    })
    assertNonNull(team, `Missing team record for teamId=${teamId}`)

    // Create the Access Key
    await prisma.d4hAccessKey.create({
        data: { ownerId: userPersonId, key: accessKey, teamId, enabled: true }
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

    const { userPersonId } = await authenticated()

    await prisma.d4hAccessKey.update({
        where: { id: accessKeyId, ownerId: userPersonId },
        data: { enabled }
    })
}


type DeleteArgs = { accessKeyId: string }

/**
 * Server Action to delete an access key record from the database.
 */
export async function deleteAccessKey({ accessKeyId }: DeleteArgs) {

    const { userPersonId } = await authenticated()

    await prisma.d4hAccessKey.delete({
        where: { id: accessKeyId, ownerId: userPersonId }
    })

    revalidatePath(Paths.account.d4hAccessKeys)
}