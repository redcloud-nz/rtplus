/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use server'

import { auth, clerkClient, currentUser } from '@clerk/nextjs/server'

import { nanoId16 } from '@/lib/id'
import { RTPlusLogger } from '@/lib/logger'
import prisma from '@/server/prisma'


const logger = new RTPlusLogger(completeOnboardingAction)

export async function completeOnboardingAction() {
    const { userId: clerkUserId, sessionClaims } = await auth.protect()
    const clerk = await clerkClient()
    const clerkUser = await currentUser()

    const personId = sessionClaims.rt_person_id

    await prisma.person.update({
        where: { id: personId },
        data: {
            onboardingStatus: 'Complete',
            changeLogs: {
                create: {
                    id: nanoId16(),
                    actorId: personId,
                    event: 'Update',
                    fields: { onboardingStatus: 'Complete' }
                }
            },
        }
    })

    await clerk.users.updateUser(clerkUserId, {
        publicMetadata: {
            ...clerkUser!.publicMetadata,
            onboarding_status: 'Complete',
        }
    })

    // Apply any team memberships
    const memberships = await prisma.teamMembership.findMany({
        where: { personId, status: 'Active', role: { not: 'None' }},
        include: { team: true }
    })

    for(const membership of memberships) {
        await clerk.organizations.createOrganizationMembership({
            organizationId: membership.team.clerkOrgId,
            userId: clerkUserId,
            role: membership.role === 'Admin' ? 'org:admin' : 'org:member'
        })
    }

    logger.debug(`Person(${personId}) updated with onboardingStatus='Complete'`)
}