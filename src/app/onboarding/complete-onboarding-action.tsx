/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use server'

import { auth, clerkClient, currentUser } from '@clerk/nextjs/server'

import prisma from '@/server/prisma'
import { RTPlusLogger } from '@/lib/logger'
import { PolicyKeyType } from '@/lib/policy'


type completeOnboardingActionArgs = {
    policies: { policyKey: PolicyKeyType, policyVersion: number }[]
}

const logger = new RTPlusLogger(completeOnboardingAction)

export async function completeOnboardingAction({ policies }: completeOnboardingActionArgs) {
    const { userId: clerkUserId, sessionClaims } = await auth.protect()
    const clerk = await clerkClient()
    const clerkUser = await currentUser()

    const personId = sessionClaims.rt_pid

    await prisma.person.update({
        where: { id: personId },
        data: {
            onboardingStatus: 'Complete',
            changeLogs: {
                create: {
                    actorId: personId,
                    event: 'Update',
                    fields: { onboardingStatus: 'Complete' }
                }
            },
            policyAcceptances: {
                create: policies.map(p => ({
                    policyKey: p.policyKey,
                    policyVersion: p.policyVersion
                }))
            }
        }
    })


    logger.debug(`Person(${personId}) updated with onboardingStatus='Complete'`)

    await clerk.users.updateUser(clerkUserId, {
        publicMetadata: {
            ...clerkUser!.publicMetadata,
            onboardingStatus: 'Complete',
        }
    })
}