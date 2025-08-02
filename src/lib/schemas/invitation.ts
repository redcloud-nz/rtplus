/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/


import { z } from 'zod'

import { OrganizationInvitation as ClerkOrganizationInvitation } from '@clerk/nextjs/server'

import { zodNanoId8 } from '../validation'

export type InvitationStatus = 'pending' | 'accepted' | 'revoked' | 'expired'

export const teamInvitationSchema = z.object({
    personId: zodNanoId8.nullable(),
    invitationId: z.string(),
    email: z.string().email('Invalid email address'),
    role: z.enum(['org:admin', 'org:member']),
    status: z.enum(['pending', 'accepted', 'expired', 'revoked']),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    expiresAt: z.string().datetime(),
})

export type TeamInvitationData = z.infer<typeof teamInvitationSchema>


export function toTeamInvitationData(invitation: ClerkOrganizationInvitation): TeamInvitationData {
    return {
        personId: invitation.publicMetadata.personId as string | null,
        invitationId: invitation.id,
        email: invitation.emailAddress,
        role: invitation.role as 'org:admin' | 'org:member',
        status: invitation.status as 'pending' | 'accepted' | 'revoked',
        createdAt: new Date(invitation.createdAt).toISOString(),
        updatedAt: new Date(invitation.updatedAt).toISOString(),
        expiresAt: new Date(invitation.expiresAt).toISOString(),
    }
}



export const InvitationStatusNameMap: Record<InvitationStatus, string> = {
    'pending': 'Pending',
    'accepted': 'Accepted',
    'revoked': 'Revoked',
    'expired': 'Expired',
}