/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/


import { z } from 'zod'

import { OrganizationMembership as ClerkOrganizationMembership } from '@clerk/nextjs/server'

import { UserData } from './user'


export const orgMembershipSchema = z.object({
    orgMembershipId: z.string(),
    userId: z.string(),
    organizationId: z.string(),
    role: z.enum(['org:admin', 'org:member']),
    createdAt: z.number(),
    updatedAt: z.number(),
})

export type OrgMembershipData = z.infer<typeof orgMembershipSchema>


/**
 * Converts a Clerk Organization Membership to the internal OrgMembershipData format.
 * @param orgMembership The Clerk Organization Membership to convert.
 * @returns The converted OrgMembershipData.
 */
export function toOrgMembershipData(orgMembership: ClerkOrganizationMembership): OrgMembershipData & { user: UserData } {
    return {
        orgMembershipId: orgMembership.id,
        role: orgMembership.role as 'org:admin' | 'org:member',
        userId: orgMembership.publicUserData?.userId || '',
        user: {
            userId: orgMembership.publicUserData?.userId || '',
            identifier: orgMembership.publicUserData?.identifier || '',
            name: `${orgMembership.publicUserData?.firstName || ''} ${orgMembership.publicUserData?.lastName || ''}`.trim() || "Unknown User",
        },
        organizationId: orgMembership.organization.id,
        createdAt: orgMembership.createdAt,
        updatedAt: orgMembership.updatedAt,
    }
}