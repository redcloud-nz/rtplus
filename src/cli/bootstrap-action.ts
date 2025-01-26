/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use server'

import { currentUser } from '@clerk/nextjs/server'
import { Person } from '@prisma/client'

import { WritePermission } from '@/lib/permissions'
import { authenticated } from '@/lib/server/auth'
import prisma from '@/lib/server/prisma'



interface BootstrapActionResult {
    success: boolean
    person?: Person
}

export async function bootstrapAction(): Promise<BootstrapActionResult> {
    
    const { userPersonId, hasPermission } = await authenticated()
    const user = (await currentUser())!

    if (!hasPermission('system:write')) {
        throw 'You do not have permission to bootstrap the system'
    }

    const personCount = await prisma.person.count()

    let createdPerson: Person | undefined = undefined
    if(personCount == 0 && userPersonId != undefined) {
        createdPerson = await prisma.person.create({
            data: {
                id: userPersonId,
                name: (user.firstName ?? '') + ' ' + (user.lastName ?? ''),
                email: user.primaryEmailAddress?.emailAddress ?? '',
                clerkUserId: user.id,
                systemPermissions: {
                    create: {
                        permissions: [WritePermission]
                    }
                }
            }
        })
    }

    return { 
        success: createdPerson != undefined,
        person: createdPerson
    }

}