/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use server'

import { clerkClient, currentUser } from '@clerk/nextjs/server'
import { Person} from '@prisma/client'

import { authenticated } from '@/server/auth'
import prisma from '@/server/prisma'


interface BootstrapActionResult {
    success: boolean
    person?: Person
}

export async function bootstrapAction(): Promise<BootstrapActionResult> {
    
    const auth = await authenticated()
    const clerkUser = (await currentUser())!

    if (!auth.hasPermission('system:write')) {
        throw 'You do not have permission to bootstrap the system'
    }

    const personCount = await prisma.person.count()

    let createdPerson: Person | undefined = undefined
    if(personCount == 0 && auth.personId != undefined) {
        const name = (clerkUser.firstName ?? '') + ' ' + (clerkUser.lastName ?? '')
        const email = clerkUser.primaryEmailAddress?.emailAddress ?? ''

        createdPerson = await prisma.person.create({
            data: {
                id: auth.personId,
                name, email,
                onboardingStatus: 'Complete',
                changeLogs: {
                    create: {
                        actorId: auth.personId,
                        event: 'Create',
                        fields: { name, email }
                    }
                }
            }
        })

        const clerk = await clerkClient()
        clerk.users.updateUser(clerkUser.id,{
            publicMetadata: {
                personId: auth.personId,
                onboardingStatus: 'Complete',
                systemPermissions: auth.permissions.rt_sp,
                teamPermissions: {},
            },
        })
    }

    return { 
        success: createdPerson != undefined,
        person: createdPerson,
    }

}
