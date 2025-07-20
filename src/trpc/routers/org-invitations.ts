/*
 *  Copyright (c) 2025 Redcloud Development, Ltd.
 *  Licensed under the MIT License. See LICENSE.md in the project root for license information.
*/

import { z } from 'zod'

import { OrganizationInvitation } from '@clerk/nextjs/server'

import { orgInvitationFormSchema } from '@/lib/schemas/org-invitation'

import { createTRPCRouter, teamAdminProcedure } from '../init'
import { OrgInvitationData } from '../types'





export const orgInvitationsRouter = createTRPCRouter({
    byCurrentTeam: teamAdminProcedure
        .query(async ({ ctx }): Promise<OrgInvitationData[]> => {
            const response = await ctx.clerkClient.organizations.getOrganizationInvitationList({ organizationId: ctx.orgId, limit: 501, status: ['pending'] })

            return response.data.map(toOrgInviteBasic)
        }),
    create: teamAdminProcedure
        .input(orgInvitationFormSchema)
        .mutation(async ({ ctx, input }): Promise<OrgInvitationData> => {

            const response = await ctx.clerkClient.organizations.createOrganizationInvitation({
                organizationId: ctx.orgId,
                inviterUserId: ctx.auth.userId,
                emailAddress: input.email,
                role: input.role,
            })

            return toOrgInviteBasic(response)
        }),
        
    revoke: teamAdminProcedure
        .input(z.object({
            invitationId: z.string().min(1, 'Invitation ID is required'),
        }))
        .mutation(async ({ ctx, input }): Promise<OrgInvitationData> => {
            const response = await ctx.clerkClient.organizations.revokeOrganizationInvitation({
                organizationId: ctx.orgId,
                invitationId: input.invitationId,
                requestingUserId: ctx.auth.userId,
            })

            return toOrgInviteBasic(response)
        }),
})

function toOrgInviteBasic(invite: OrganizationInvitation): OrgInvitationData {
    return {
        id: invite.id,
        email: invite.emailAddress,
        role: invite.role,
        createdAt: invite.createdAt,
    }
}
