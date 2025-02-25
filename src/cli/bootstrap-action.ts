/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use server'

import { clerkClient, currentUser } from '@clerk/nextjs/server'
import { Person, User } from '@prisma/client'

import { createUUID } from '@/lib/id'
import { authenticated } from '@/server/auth'
import prisma from '@/server/prisma'
import { SystemShortKey, SystemShortKeyToPermissionKeyMap } from '@/lib/permissions'
import { on } from 'events'


interface BootstrapActionResult {
    success: boolean
    person?: Person
    user?: User
}

export async function bootstrapAction(): Promise<BootstrapActionResult> {
    
    const auth = await authenticated()
    const clerkUser = (await currentUser())!

    if (!auth.hasPermission('system:write')) {
        throw 'You do not have permission to bootstrap the system'
    }

    const userCount = await prisma.user.count()

    let createdUser: User | undefined = undefined
    let createdPerson: Person | undefined = undefined
    if(userCount == 0 && auth.userId != undefined) {
        const name = (clerkUser.firstName ?? '') + ' ' + (clerkUser.lastName ?? '')
        const email = clerkUser.primaryEmailAddress?.emailAddress ?? ''

        const personId = auth.userPersonId ?? createUUID()
        const userId = auth.userId

        createdPerson = await prisma.person.create({
            data: {
                id: personId,
                slug: personId,
                name, email,
            }
        })

        createdUser = await prisma.user.create({
            data: {
                id: userId,
                personId,
                clerkUserId: clerkUser.id,
                name, email,
                onboardingStatus: 'Complete',
                systemPermissions: { set: auth.permissions.rt_sp.split('').map(k => SystemShortKeyToPermissionKeyMap[k as SystemShortKey]) },
                changeLogs: {
                    create: {
                        actorId: userId,
                        event: 'Create',
                        fields: { personId, name, email }
                    }
                }
            }
        })

        await prisma.personChangeLog.create({
            data: {
                actorId: userId,
                personId,
                event: 'Create',
                fields: { name, email, slug: personId }
            }
        })

        const clerk = await clerkClient()
        clerk.users.updateUser(clerkUser.id,{
            publicMetadata: {
                userId,
                userPersonId: personId,
                onboardingStatus: 'Complete',
                systemPermissions: auth.permissions.rt_sp,
                teamPermissions: {},
            },
        })
    }

    return { 
        success: createdUser != undefined,
        person: createdPerson,
        user: createdUser
    }

}
