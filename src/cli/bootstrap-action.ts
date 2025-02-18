/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
'use server'

import { currentUser } from '@clerk/nextjs/server'
import { Person, User } from '@prisma/client'

import { createUUID } from '@/lib/id'
import { authenticated } from '@/server/auth'
import prisma from '@/server/prisma'


interface BootstrapActionResult {
    success: boolean
    person?: Person
    user?: User
}

export async function bootstrapAction(): Promise<BootstrapActionResult> {
    
    const { userId, userPersonId = createUUID(), hasPermission, permissions } = await authenticated()
    const user = (await currentUser())!

    if (!hasPermission('system:write')) {
        throw 'You do not have permission to bootstrap the system'
    }

    const userCount = await prisma.user.count()

    let createdUser: User | undefined = undefined
    let createdPerson: Person | undefined = undefined
    if(userCount == 0 && userId != undefined) {
        const name = (user.firstName ?? '') + ' ' + (user.lastName ?? '')
        const email = user.primaryEmailAddress?.emailAddress ?? ''

        createdPerson = await prisma.person.create({
            data: {
                id: userPersonId,
                slug: userPersonId,
                name, email,
            }
        })

        createdUser = await prisma.user.create({
            data: {
                id: userId,
                personId: userPersonId,
                name, email,
                changeLogs: {
                    create: {
                        actorId: userId,
                        event: 'Create',
                        fields: { personId: userPersonId, name, email }
                    }
                }
            }
        })

        await prisma.personChangeLog.create({
            data: {
                actorId: userId,
                personId: userPersonId,
                event: 'Create',
                fields: { name, email }
            }
        })

        
    }

    return { 
        success: createdUser != undefined,
        person: createdPerson,
        user: createdUser
    }

}
