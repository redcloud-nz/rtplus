/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use server'

import { auth, clerkClient, currentUser } from '@clerk/nextjs/server'
import { Person} from '@prisma/client'

import prisma from '@/server/prisma'
import { nanoId16 } from '@/lib/id'


interface BootstrapActionResult {
    success: boolean
    person?: Person
}

export async function bootstrapAction(): Promise<BootstrapActionResult> {
    
    const { sessionClaims: { rt_person_id: personId, rt_system_role: systemRole } } = await auth.protect()
    const clerkUser = (await currentUser())!

    if(systemRole != 'admin') throw new Error('Unauthorized')

    const personCount = await prisma.person.count()

    let createdPerson: Person | undefined = undefined
    if(personCount == 0 && personId != undefined) {
        const name = (clerkUser.firstName ?? '') + ' ' + (clerkUser.lastName ?? '')
        const email = clerkUser.primaryEmailAddress?.emailAddress ?? ''

        createdPerson = await prisma.person.create({
            data: {
                id: personId,
                name, email,
                changeLogs: {
                    create: {
                        id: nanoId16(),
                        actorId: personId,
                        event: 'Create',
                        fields: { name, email }
                    }
                }
            }
        })

        const clerk = await clerkClient()
        clerk.users.updateUser(clerkUser.id,{
            publicMetadata: {
                ...clerkUser.publicMetadata,
                onboardingStatus: 'Complete',
            },
        })
    }

    return { 
        success: createdPerson != undefined,
        person: createdPerson,
    }

}
