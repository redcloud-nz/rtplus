/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
 * 
 * Path: /onboarding
 */

import { redirect } from 'next/navigation'

import { auth, createClerkClient } from '@clerk/nextjs/server'

import { nanoId16, nanoId8 } from '@/lib/id'

import * as Paths from '@/paths'
import prisma from '@/server/prisma'



export default async function Onboarding_Page(props: { searchParams: Promise<{ redirect_url?: string }> }) {
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
            
        const fields = {
            name: user.fullName || `${user.firstName} ${user.lastName}`.trim() || 'New User',
            email: userEmail,
            clerkUserId: userId,
        }

        const person = await prisma.person.upsert({
            where: { email: userEmail },
            create: {
                id: nanoId8(),
                ...fields,
                changeLogs: {
                    create: {
                        id: nanoId16(),
                        event: 'Create',
                        fields: fields
                    }
                }
            },
            update: {
                ...fields,
                changeLogs: {
                    create: {
                        id: nanoId16(),
                        event: 'Update',
                        fields: fields
                    }
                }
            }
        })

        // Update user public metadata
        await clerkClient.users.updateUserMetadata(userId, {
            publicMetadata: {
                ...user.publicMetadata,
                person_id: person.id,
                onboarding_status: 'complete',
            },
        })
    }

    

    return redirect(decoded ?? Paths.selectTeam.href)
}