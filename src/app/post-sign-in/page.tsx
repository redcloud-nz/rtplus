/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * /post-sign-in
 */

import { auth, createClerkClient } from '@clerk/nextjs/server'

import { resolveAfter } from '@/lib/utils'

import prisma from '@/server/prisma'


export default async function PostSignInLoading() {

    const { sessionClaims, userId } = await auth.protect()

    const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
    const user = await clerkClient.users.getUser(userId)

    const userEmail = user.primaryEmailAddress?.emailAddress
    if(userEmail == null) {
        throw new Error("No email address found for user. Please contact support.")
    }

    const personId = sessionClaims.rt_person_id
        
    const person = await prisma.person.findUnique({
        where: { id: personId },
    })

    if(person == null) {
        // Create a new person if it doesn't exist
        await prisma.person.create({
            data: {
                id: personId,
                name: user.fullName || `${user.firstName} ${user.lastName}`.trim() || 'New User',
                email: userEmail,
                clerkUserId: userId,
                inviteStatus: 'Complete',
            },
        })
    } else if(person.clerkUserId !== userId) {
        // If the person exists but is linked to a different user, update it
        await prisma.person.update({
            where: { id: personId },
            data: {
                clerkUserId: userId,
                email: userEmail,
                name: user.fullName || `${user.firstName} ${user.lastName}`.trim() || 'Updated User',
                inviteStatus: 'Complete',
            },
        })
    }    

    await resolveAfter(null, 2000) // Simulate a delay for loading

    return (
        <div className="flex flex-col items-center justify-center w-full h-screen">
            Loaded
        </div>
    )
}