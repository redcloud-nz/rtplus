/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { User as ClerkUser, OrganizationMembership as ClerkOrganizationMembership } from '@clerk/nextjs/server'

export const userSchema = z.object({
    userId: z.string(),
    identifier: z.string(),
    name: z.string()
})

export type UserData = z.infer<typeof userSchema>


export const userSchema2 = z.object({
    personId: z.string(),
    name: z.string(),
    email: z.string().email(),
    clerkUserId: z.string().nullable(),
    role: z.enum(['org:admin', 'org:member']),
    lastActiveAt: z.string().datetime().nullable(),
    createdAt: z.string().datetime(),
})

export type UserData2 = z.infer<typeof userSchema2>

export type UserRole = 'org:admin' | 'org:member'


export function toUserData(user: ClerkUser, membership: ClerkOrganizationMembership): UserData2 {
    return {
        personId: user.publicMetadata.person_id,
        name: user.fullName || "",
        email: user.emailAddresses[0]?.emailAddress || '',
        clerkUserId: user.id,
        role: membership.role as 'org:admin' | 'org:member',
        lastActiveAt: user.lastActiveAt ? new Date(user.lastActiveAt).toISOString() : null,
        createdAt: new Date(user.createdAt).toISOString(),
    }
}


export const UserRoleNameMap: Record<UserRole, string> = {
    'org:admin': 'Admin',
    'org:member': 'Member',
}