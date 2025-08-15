/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /onboarding
 */

import { redirect } from 'next/navigation'

import { auth, createClerkClient } from '@clerk/nextjs/server'

import { nanoId8 } from '@/lib/id'

import * as Paths from '@/paths'
import prisma from '@/server/prisma'



export default async function OnBoarding_Page(props: { searchParams: Promise<{ redirect_url?: string }> }) {
    const { redirect_url } = await props.searchParams
    const decoded = redirect_url ? decodeURIComponent(redirect_url) : null

    const { sessionClaims, userId } = await auth.protect()

    if(sessionClaims.rt_onboarding_status != 'complete') {
        const clerkClient = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })
        const user = await clerkClient.users.getUser(userId)

        const userEmail = user.primaryEmailAddress?.emailAddress
        if(userEmail == null) {
            throw new Error("No email address found for user. Please contact support.")
        }

        const personId = sessionClaims.rt_person_id ?? nanoId8()
            
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
                },
            })
        }    

        // Update user public metadata
        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                ...user.publicMetadata,
                person_id: personId,
                onboarding_status: 'complete',
            },
        })
    }

    

    return redirect(decoded ?? Paths.teams.select.index)
}