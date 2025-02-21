/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 */
'use server'

import { auth, clerkClient, currentUser } from '@clerk/nextjs/server'

import prisma from '@/server/prisma'
import { buildCompactSystemPermissions, buildCompactTeamPermissions, SystemPermissionKey, SystemShortKey, SystemShortKeyToPermissionKeyMap } from '@/lib/permissions'
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

    const userId = sessionClaims.rt_uid

    const existingUser = await prisma.user.findUnique({ 
        where: { id: userId },
        include: {
            teamPermissions: true
        }
    })
    
    if(existingUser) {

        // Update
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                clerkUserId,
                onboardingStatus: 'Complete',
                policyAcceptances: {
                    create: policies.map(p => ({
                        policyKey: p.policyKey,
                        policyVersion: p.policyVersion
                    }))
                }
            }
        })
        logger.debug(`User(${updatedUser.id}, ${updatedUser.name}) updated`)

        await clerk.users.updateUser(clerkUserId, {
            publicMetadata: {
                ...clerkUser!.publicMetadata,
                userPersonId: existingUser.personId ?? undefined,
                onboardingStatus: 'Complete',
                systemPermissions: buildCompactSystemPermissions(existingUser.systemPermissions as SystemPermissionKey[]),
                teamPermissions: buildCompactTeamPermissions(existingUser.teamPermissions)
            }
        })
    } else {
        // No RT+ User. The user must have been created manually in Clerk
        const systemPermissions = ((sessionClaims.rt_sp ?? "").split('') as SystemShortKey[]).map(k => SystemShortKeyToPermissionKeyMap[k])
       
        let person = sessionClaims.rt_pid ? await prisma.person.findUnique({ where: { id: sessionClaims.rt_pid } }) : null
        if(sessionClaims.rt_pid && !person) {
            person = await prisma.person.create({
                data: {
                    id: sessionClaims.rt_pid,
                    name: clerkUser!.fullName ?? "Unknown",
                    email: clerkUser!.emailAddresses[0].emailAddress,
                    slug: sessionClaims.rt_pid,
                }
            })
            logger.info(`Person(${person.id}, ${person.name}) created`)
        }

        const createdUser = await prisma.user.create({
            data: {
                id: userId,
                name: clerkUser!.fullName ?? "Unknown",
                email: clerkUser!.emailAddresses[0].emailAddress,
                clerkUserId,
                
                onboardingStatus: 'Complete',
                policyAcceptances: {
                    create: policies.map(p => ({
                        policyKey: p.policyKey,
                        policyVersion: p.policyVersion
                    }))
                },
                systemPermissions,
            }
        })
        logger.info(`User(${createdUser}, ${createdUser.name}) created`)

        await clerk.users.updateUser(clerkUserId, {
            publicMetadata: {
                ...clerkUser!.publicMetadata,
                onboardingStatus: 'Complete',
            }
        })
    }
}