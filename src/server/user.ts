/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 */
import 'server-only'

import { cacheTag, revalidateTag } from 'next/cache'
import { notFound } from 'next/navigation'

import { toUserData, UserData } from '@/lib/schemas/user'

import { getClerkClient } from './clerk'
import prisma from './prisma'




export async function getUser(userId: string): Promise<UserData> {
    'use cache'
    cacheTag(`user-${userId}`)

    const clerk = getClerkClient()
    const clerkUser = await clerk.users.getUser(userId)

    if(!clerkUser) return notFound()

    let userRecord = await prisma.user.findFirst({ where: { userId: clerkUser.id } })
    
    // Ensure that there is an organization record in our database
    if(!userRecord) {
        userRecord = await prisma.user.create({
            data: {
                userId: clerkUser.id,
                name: clerkUser.fullName || 'Unnamed User',
                email: clerkUser.primaryEmailAddress?.emailAddress || '',
                settings: {},
            }
        })
    }

    return toUserData(userRecord)

}

export async function revalidateUser(userId: string) {
    revalidateTag(`user-${userId}`, { expire: 0 })
}
